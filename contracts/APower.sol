// SPDX-License-Identifier: GPL-3.0
// solhint-disable no-empty-blocks
pragma solidity ^0.8.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

import {XPower} from "./XPower.sol";
import {SovMigratable} from "./base/Migratable.sol";

/**
 * Abstract base class for the APower aTHOR, aLOKI and aODIN tokens, where only
 * the owner of the contract i.e the MoeTreasury is entitled to mint them.
 */
abstract contract APower is ERC20, ERC20Burnable, SovMigratable, Ownable {
    /** (burnable) proof-of-work tokens */
    XPower private _moe;

    /** @param symbol short token symbol */
    /** @param moeLink address of XPower tokens */
    /** @param sovBase address of old contract */
    /** @param deadlineIn seconds to end-of-migration */
    constructor(
        string memory symbol,
        address moeLink,
        address[] memory sovBase,
        uint256 deadlineIn
    )
        // ERC20 constructor: name, symbol
        ERC20("APower", symbol)
        // Migratable: XPower, old APower & rel. deadline [seconds]
        SovMigratable(moeLink, sovBase, deadlineIn)
    {
        _moe = XPower(moeLink);
    }

    /** mint amount of tokens for beneficiary (after wrapping XPower) */
    function mint(address to, uint256 amount) public onlyOwner {
        _moe.transferFrom(owner(), (address)(this), amount);
        _mint(to, amount);
    }

    /** burn amount of tokens from caller (and then unwrap XPower) */
    function burn(uint256 amount) public override {
        super.burn(amount);
        _moe.transfer(msg.sender, amount);
    }

    /**
     * burn amount of tokens from account, deducting from the caller's
     * allowance (and then unwrap XPower)
     */
    function burnFrom(address account, uint256 amount) public override {
        super.burnFrom(account, amount);
        _moe.transfer(account, amount);
    }

    /** @return prefix of token */
    function prefix() public view returns (uint256) {
        return _moe.prefix();
    }
}

contract APowerThor is APower {
    /** @param moeLink address of XPower tokens */
    /** @param sovBase address of old contract */
    /** @param deadlineIn seconds to end-of-migration */
    constructor(
        address moeLink,
        address[] memory sovBase,
        uint256 deadlineIn
    ) APower("aTHOR", moeLink, sovBase, deadlineIn) {}
}

contract APowerLoki is APower {
    /** @param moeLink address of XPower tokens */
    /** @param sovBase address of old contract */
    /** @param deadlineIn seconds to end-of-migration */
    constructor(
        address moeLink,
        address[] memory sovBase,
        uint256 deadlineIn
    ) APower("aLOKI", moeLink, sovBase, deadlineIn) {}
}

contract APowerOdin is APower {
    /** @param moeLink address of XPower tokens */
    /** @param sovBase address of old contract */
    /** @param deadlineIn seconds to end-of-migration */
    constructor(
        address moeLink,
        address[] memory sovBase,
        uint256 deadlineIn
    ) APower("aODIN", moeLink, sovBase, deadlineIn) {}
}
