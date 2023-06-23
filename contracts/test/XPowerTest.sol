// SPDX-License-Identifier: GPL-3.0
// solhint-disable not-rely-on-time
// solhint-disable no-empty-blocks
pragma solidity ^0.8.0;

import {XPowerThor} from "../XPower.sol";
import {XPowerLoki} from "../XPower.sol";
import {XPowerOdin} from "../XPower.sol";

/** Test class for XPowerThor */
contract XPowerThorTest is XPowerThor {
    constructor(address[] memory _base, uint256 _deadlineIn) XPowerThor(_base, _deadlineIn) {}

    function cache(bytes32 _blockHash) public {
        _cache(_blockHash, block.timestamp);
    }
}

contract XPowerThorOldTest is XPowerThorTest {
    constructor(address[] memory _base, uint256 _deadlineIn) XPowerThorTest(_base, _deadlineIn) {}

    function decimals() public pure override returns (uint8) {
        return 0;
    }
}

contract XPowerThorOldTest36 is XPowerThorTest {
    constructor(address[] memory _base, uint256 _deadlineIn) XPowerThorTest(_base, _deadlineIn) {}

    function decimals() public pure override returns (uint8) {
        return 36;
    }
}

/** Test class for XPowerLoki */
contract XPowerLokiTest is XPowerLoki {
    constructor(address[] memory _base, uint256 _deadlineIn) XPowerLoki(_base, _deadlineIn) {}

    function cache(bytes32 _blockHash) public {
        _cache(_blockHash, block.timestamp);
    }
}

contract XPowerLokiOldTest is XPowerLokiTest {
    constructor(address[] memory _base, uint256 _deadlineIn) XPowerLokiTest(_base, _deadlineIn) {}

    function decimals() public pure override returns (uint8) {
        return 0;
    }
}

contract XPowerLokiOldTest36 is XPowerLokiTest {
    constructor(address[] memory _base, uint256 _deadlineIn) XPowerLokiTest(_base, _deadlineIn) {}

    function decimals() public pure override returns (uint8) {
        return 36;
    }
}

/** Test class for XPowerOdin */
contract XPowerOdinTest is XPowerOdin {
    constructor(address[] memory _base, uint256 _deadlineIn) XPowerOdin(_base, _deadlineIn) {}

    function cache(bytes32 _blockHash) public {
        _cache(_blockHash, block.timestamp);
    }
}

contract XPowerOdinOldTest is XPowerOdinTest {
    constructor(address[] memory _base, uint256 _deadlineIn) XPowerOdinTest(_base, _deadlineIn) {}

    function decimals() public pure override returns (uint8) {
        return 0;
    }
}

contract XPowerOdinOldTest36 is XPowerOdinTest {
    constructor(address[] memory _base, uint256 _deadlineIn) XPowerOdinTest(_base, _deadlineIn) {}

    function decimals() public pure override returns (uint8) {
        return 36;
    }
}
