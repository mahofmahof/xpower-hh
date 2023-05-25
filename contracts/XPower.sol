// SPDX-License-Identifier: GPL-3.0
// solhint-disable not-rely-on-time
// solhint-disable no-empty-blocks
pragma solidity ^0.8.0;

import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

import {FeeTracker} from "./base/FeeTracker.sol";
import {Migratable, MoeMigratable} from "./base/Migratable.sol";
import {Supervised, XPowerSupervised} from "./base/Supervised.sol";

import {Constants} from "./libs/Constants.sol";
import {Integrator} from "./libs/Integrator.sol";
import {Polynomials, Polynomial} from "./libs/Polynomials.sol";
import {Rpp} from "./libs/Rpp.sol";

/**
 * Abstract base class for the XPower THOR, LOKI and ODIN proof-of-work tokens.
 * It verifies, that the nonce & the block-hash do result in a positive amount,
 * (as specified by the sub-classes). After the verification, the corresponding
 * amount of tokens are minted for the beneficiary (plus the treasury).
 */
abstract contract XPower is ERC20, ERC20Burnable, MoeMigratable, FeeTracker, XPowerSupervised, Ownable {
    using Integrator for Integrator.Item[];
    using Polynomials for Polynomial;

    /** set of nonce-hashes already minted for */
    mapping(bytes32 => bool) private _hashes;
    /** map from block-hashes to timestamps */
    mapping(bytes16 => uint256) private _timestamps;
    /** map from intervals to block-hashes */
    mapping(uint256 => bytes16) private _blockHashes;

    /** @param symbol short token symbol */
    /** @param moeBase addresses of old contracts */
    /** @param deadlineIn seconds to end-of-migration */
    constructor(
        string memory symbol,
        address[] memory moeBase,
        uint256 deadlineIn
    )
        // ERC20 constructor: name, symbol
        ERC20("XPower", symbol)
        // Migratable: old contract, rel. deadline [seconds]
        Migratable(moeBase, deadlineIn)
    {}

    /** @return number of decimals of representation */
    function decimals() public view virtual override returns (uint8) {
        return Constants.DECIMALS;
    }

    /** emitted on caching most recent block-hash */
    event Init(bytes16 blockHash, uint256 timestamp);

    /** cache most recent block-hash */
    function init() public {
        uint256 interval = currentInterval();
        assert(interval > 0);
        if (uint128(_blockHashes[interval]) == 0) {
            bytes16 blockHash = bytes16(blockhash(block.number - 1));
            assert(blockHash > 0);
            uint256 timestamp = block.timestamp;
            assert(timestamp > 0);
            _cache(blockHash, timestamp);
            _blockHashes[interval] = blockHash;
            emit Init(blockHash, timestamp);
        } else {
            bytes16 blockHash = _blockHashes[interval];
            uint256 timestamp = _timestamps[blockHash];
            emit Init(blockHash, timestamp);
        }
    }

    /** cache block-hash at timestamp */
    function _cache(bytes16 blockHash, uint256 timestamp) internal {
        _timestamps[blockHash] = timestamp;
    }

    /** mint tokens for to-beneficiary, block-hash & data (incl. nonce) */
    function mint(address to, bytes16 blockHash, bytes memory data) public tracked {
        // check block-hash to be in current interval
        require(recent(blockHash), "expired block-hash");
        // calculate nonce-hash for to, block-hash & data
        bytes32 nonceHash = hashOf(to, blockHash, data);
        require(unique(nonceHash), "duplicate nonce-hash");
        // calculate number of zeros of nonce-hash
        uint256 zeros = zerosOf(nonceHash);
        require(zeros > 0, "empty nonce-hash");
        // calculate amount of tokens of zeros
        uint256 amount = amountOf(zeros);
        // ensure unique nonce-hash
        _hashes[nonceHash] = true;
        // mint for project treasury
        _mint(owner(), shareOf(amount));
        // mint for beneficiary
        _mint(to, amount);
    }

    /** @return block-hash (for interval) */
    function blockHashOf(uint256 interval) public view returns (bytes16) {
        return _blockHashes[interval];
    }

    /** @return current interval's timestamp */
    function currentInterval() public view returns (uint256) {
        return block.timestamp - (block.timestamp % (1 hours));
    }

    /** check whether block-hash has recently been cached */
    function recent(bytes16 blockHash) public view returns (bool) {
        return _timestamps[blockHash] > currentInterval();
    }

    /** @return hash of contract, to-beneficiary, block-hash & data (incl. nonce) */
    function hashOf(address to, bytes16 blockHash, bytes memory data) public view returns (bytes32) {
        bytes32 hash1 = sha256(bytes.concat(bytes20(uint160(address(this)) ^ uint160(to)), bytes16(blockHash), data));
        bytes32 hash2 = sha256(bytes.concat(hash1));
        return hash2;
    }

    /** check whether nonce-hash is unique */
    function unique(bytes32 nonceHash) public view returns (bool) {
        return !_hashes[nonceHash];
    }

    /** @return leading-zeros (for nonce-hash) */
    function zerosOf(bytes32 nonceHash) public pure returns (uint8) {
        if (nonceHash > 0) {
            return uint8(63 - (Math.log2(uint256(nonceHash)) >> 2));
        }
        return 64;
    }

    /** @return amount (for level) */
    function amountOf(uint256 level) public view virtual returns (uint256);

    /** integrator of shares: [(stamp, value)] */
    Integrator.Item[] public shares;
    /** parametrization of share: coefficients */
    uint256[] private _share;

    /** @return duration weighted mean of shares (for amount) */
    function shareOf(uint256 amount) public view returns (uint256) {
        if (shares.length == 0) {
            return shareTargetOf(amount);
        }
        uint256 stamp = block.timestamp;
        uint256 value = shareTargetOf(amountOf(1));
        uint256 point = shares.meanOf(stamp, value);
        return (point * amount) / amountOf(1);
    }

    /** @return share target (for amount) */
    function shareTargetOf(uint256 amount) public view returns (uint256) {
        return shareTargetOf(amount, getShare());
    }

    /** @return share target (for amount & parametrization) */
    function shareTargetOf(uint256 amount, uint256[] memory array) private pure returns (uint256) {
        return Polynomial(array).eval4Clamped(amount);
    }

    /** fractional treasury share: 50[%] */
    uint256 private constant SHARE_MUL = 1;
    uint256 private constant SHARE_DIV = 2;

    /** @return share parameters */
    function getShare() public view returns (uint256[] memory) {
        if (_share.length > 0) {
            return _share;
        }
        uint256[] memory array = new uint256[](4);
        array[3] = SHARE_MUL;
        array[2] = SHARE_DIV;
        return array;
    }

    /** set share parameters */
    function setShare(uint256[] memory array) public onlyRole(SHARE_ROLE) {
        Rpp.checkArray(array);
        // check share reparametrization of value
        uint256 nextValue = shareTargetOf(amountOf(1), array);
        uint256 currValue = shareTargetOf(amountOf(1));
        Rpp.checkValue(nextValue, currValue);
        // check share reparametrization of stamp
        uint256 lastStamp = shares.lastOf().stamp;
        uint256 currStamp = block.timestamp;
        Rpp.checkStamp(currStamp, lastStamp);
        // append (stamp, share-of) to integrator
        shares.append(currStamp, currValue);
        // all requirements true: use array
        _share = array;
    }

    /** @return true if this contract implements the interface defined by interfaceId */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(MoeMigratable, Supervised) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /** @return prefix of token */
    function prefix() public pure virtual returns (uint256);
}

/**
 * Allow mining & minting for THOR proof-of-work tokens, where the rewarded
 * amount equals to *only* |leading-zeros(nonce-hash)|.
 */
contract XPowerThor is XPower {
    /** @param moeBase addresses of old contracts */
    /** @param deadlineIn seconds to end-of-migration */
    constructor(address[] memory moeBase, uint256 deadlineIn) XPower("THOR", moeBase, deadlineIn) {}

    /** @return amount (for level) */
    function amountOf(uint256 level) public view override returns (uint256) {
        return level * 10 ** decimals();
    }

    /** @return prefix of token */
    function prefix() public pure override returns (uint256) {
        return 1;
    }

    /** @return fee-estimate and averages over gas & gas-price */
    function fees() public view returns (uint256[] memory) {
        return _fees(FEE_MUL, FEE_DIV);
    }

    /** fee-tracker estimate ~ 1.525 */
    uint256 private constant FEE_MUL = 1_5252519411441514;
    uint256 private constant FEE_DIV = 1_0000000000000000;
}

/**
 * Allow mining & minting for LOKI proof-of-work tokens, where the rewarded
 * amount equals to 2 ^ |leading-zeros(nonce-hash)| - 1.
 */
contract XPowerLoki is XPower {
    /** @param moeBase addresses of old contracts */
    /** @param deadlineIn seconds to end-of-migration */
    constructor(address[] memory moeBase, uint256 deadlineIn) XPower("LOKI", moeBase, deadlineIn) {}

    /** @return amount (for level) */
    function amountOf(uint256 level) public view override returns (uint256) {
        return (2 ** level - 1) * 10 ** decimals();
    }

    /** @return prefix of token */
    function prefix() public pure override returns (uint256) {
        return 2;
    }

    /** @return fee-estimate and averages over gas & gas-price */
    function fees() public view returns (uint256[] memory) {
        return _fees(FEE_MUL, FEE_DIV);
    }

    /** fee-tracker estimate ~ 1.522 */
    uint256 private constant FEE_MUL = 1_5222760077895132;
    uint256 private constant FEE_DIV = 1_0000000000000000;
}

/**
 * Allow mining & minting for ODIN proof-of-work tokens, where the rewarded
 * amount equals to 16 ^ |leading-zeros(nonce-hash)| - 1.
 */
contract XPowerOdin is XPower {
    /** @param moeBase addresses of old contracts */
    /** @param deadlineIn seconds to end-of-migration */
    constructor(address[] memory moeBase, uint256 deadlineIn) XPower("ODIN", moeBase, deadlineIn) {}

    /** @return amount (for level) */
    function amountOf(uint256 level) public view override returns (uint256) {
        return (16 ** level - 1) * 10 ** decimals();
    }

    /** @return prefix of token */
    function prefix() public pure override returns (uint256) {
        return 3;
    }

    /** @return fee-estimate and averages over gas & gas-price */
    function fees() public view returns (uint256[] memory) {
        return _fees(FEE_MUL, FEE_DIV);
    }

    /** fee-tracker estimate ~ 1.521 */
    uint256 private constant FEE_MUL = 1_5212763842396897;
    uint256 private constant FEE_DIV = 1_0000000000000000;
}
