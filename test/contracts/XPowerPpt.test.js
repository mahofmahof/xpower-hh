/* eslint no-unused-expressions: [off] */
/* eslint no-unused-vars: [off] */
const { expect } = require("chai");
const { ethers, network } = require("hardhat");

let accounts; // all accounts
let addresses; // all addresses
let Ppt; // contract
let nft_staked; // instance

const DATA =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
const NFT_LOKI_URL = "https://xpowermine.com/nfts/loki/{id}.json";
const DEADLINE = 126_230_400; // [seconds] i.e. 4 years

describe("XPowerPpt", async function () {
  before(async function () {
    await network.provider.send("hardhat_reset");
  });
  before(async function () {
    accounts = await ethers.getSigners();
    expect(accounts.length).to.be.greaterThan(0);
    addresses = accounts.map((acc) => acc.address);
    expect(addresses.length).to.be.greaterThan(1);
  });
  before(async function () {
    Ppt = await ethers.getContractFactory("XPowerPpt");
    expect(Ppt).to.exist;
  });
  beforeEach(async function () {
    nft_staked = await Ppt.deploy(NFT_LOKI_URL, [], DEADLINE);
    expect(nft_staked).to.exist;
    await nft_staked.deployed();
  });
  describe("mint", async function () {
    it("should mint nft-staked for amount=1", async function () {
      await mintPpt(202100, 1);
    });
  });
  describe("mint-batch", async function () {
    it("should mint nft-staked for amount=1", async function () {
      await mintBatchPpt(202100, 1);
    });
  });
  describe("burn", async function () {
    it("should burn nft-staked for amount=3", async function () {
      await mintPpt(202100, 5);
      await burnPpt(202100, 5);
    });
  });
  describe("mint-batch", async function () {
    it("should mint nft-staked for amount=1", async function () {
      await mintBatchPpt(202100, 1);
    });
  });
  describe("burn-batch", async function () {
    it("should burn nft-staked for amount=3", async function () {
      await mintBatchPpt(202100, 5);
      await burnBatchPpt(202100, 5);
    });
  });
  describe("age [10×mint]", async function () {
    it("should mint nft-staked & check age", async function () {
      expect(await ageOf(addresses[0], 202100)).to.approximately(0, 5);
      // mint:
      await nft_staked.mint(addresses[0], 202100, 1);
      expect(await ageOf(addresses[0], 202100)).to.approximately(0, 5);
      await network.provider.send("evm_increaseTime", [100]);
      await nft_staked.mint(addresses[0], 202100, 1);
      expect(await ageOf(addresses[0], 202100)).to.approximately(50, 5);
      await network.provider.send("evm_increaseTime", [100]);
      await nft_staked.mint(addresses[0], 202100, 1);
      expect(await ageOf(addresses[0], 202100)).to.approximately(100, 5);
      await network.provider.send("evm_increaseTime", [100]);
      await nft_staked.mint(addresses[0], 202100, 1);
      expect(await ageOf(addresses[0], 202100)).to.approximately(150, 5);
      await network.provider.send("evm_increaseTime", [100]);
      await nft_staked.mint(addresses[0], 202100, 1);
      expect(await ageOf(addresses[0], 202100)).to.approximately(200, 5);
      await network.provider.send("evm_increaseTime", [100]);
      await nft_staked.mint(addresses[0], 202100, 1);
      expect(await ageOf(addresses[0], 202100)).to.approximately(250, 5);
      await network.provider.send("evm_increaseTime", [100]);
      await nft_staked.mint(addresses[0], 202100, 1);
      expect(await ageOf(addresses[0], 202100)).to.approximately(300, 5);
      await network.provider.send("evm_increaseTime", [100]);
      await nft_staked.mint(addresses[0], 202100, 1);
      expect(await ageOf(addresses[0], 202100)).to.approximately(350, 5);
      await network.provider.send("evm_increaseTime", [100]);
      await nft_staked.mint(addresses[0], 202100, 1);
      expect(await ageOf(addresses[0], 202100)).to.approximately(400, 5);
      await network.provider.send("evm_increaseTime", [100]);
      await nft_staked.mint(addresses[0], 202100, 1);
      expect(await ageOf(addresses[0], 202100)).to.approximately(450, 5);
      await network.provider.send("evm_increaseTime", [100]);
    });
  });
  describe("age [5×mint, 5×burn]", async function () {
    it("should mint/burn nft-staked & check age", async function () {
      expect(await ageOf(addresses[0], 202103)).to.approximately(0, 5);
      // mint:
      await nft_staked.mint(addresses[0], 202103, 1);
      expect(await ageOf(addresses[0], 202103)).to.approximately(0, 5);
      await network.provider.send("evm_increaseTime", [100]);
      await nft_staked.mint(addresses[0], 202103, 1);
      expect(await ageOf(addresses[0], 202103)).to.approximately(50, 5);
      await network.provider.send("evm_increaseTime", [100]);
      await nft_staked.mint(addresses[0], 202103, 1);
      expect(await ageOf(addresses[0], 202103)).to.approximately(100, 5);
      await network.provider.send("evm_increaseTime", [100]);
      await nft_staked.mint(addresses[0], 202103, 1);
      expect(await ageOf(addresses[0], 202103)).to.approximately(150, 5);
      await network.provider.send("evm_increaseTime", [100]);
      await nft_staked.mint(addresses[0], 202103, 1);
      expect(await ageOf(addresses[0], 202103)).to.approximately(200, 5);
      await network.provider.send("evm_increaseTime", [100]);
      // burn:
      await nft_staked.burn(addresses[0], 202103, 1);
      expect(await ageOf(addresses[0], 202103)).to.approximately(375, 5);
      await network.provider.send("evm_increaseTime", [100]);
      await nft_staked.burn(addresses[0], 202103, 1);
      expect(await ageOf(addresses[0], 202103)).to.approximately(634, 5);
      await network.provider.send("evm_increaseTime", [100]);
      await nft_staked.burn(addresses[0], 202103, 1);
      expect(await ageOf(addresses[0], 202103)).to.approximately(1100, 5);
      await network.provider.send("evm_increaseTime", [100]);
      await nft_staked.burn(addresses[0], 202103, 1);
      expect(await ageOf(addresses[0], 202103)).to.approximately(2400, 5);
      await network.provider.send("evm_increaseTime", [100]);
      await nft_staked.burn(addresses[0], 202103, 1);
      expect(await ageOf(addresses[0], 202103)).to.approximately(0, 5);
      await network.provider.send("evm_increaseTime", [100]);
    });
  });
  describe("age [mint, burn, mint, burn, ...]", async function () {
    it("should mint/burn nft-staked & check age", async function () {
      expect(await ageOf(addresses[0], 202106)).to.approximately(0, 5);
      // mint:
      await nft_staked.mint(addresses[0], 202106, 1);
      expect(await ageOf(addresses[0], 202106)).to.approximately(0, 5);
      await network.provider.send("evm_increaseTime", [100]);
      // burn:
      await nft_staked.burn(addresses[0], 202106, 1);
      expect(await ageOf(addresses[0], 202106)).to.approximately(0, 5);
      await network.provider.send("evm_increaseTime", [100]);
      // mint:
      await nft_staked.mint(addresses[0], 202106, 1);
      expect(await ageOf(addresses[0], 202106)).to.approximately(100, 5);
      await network.provider.send("evm_increaseTime", [100]);
      // burn:
      await nft_staked.burn(addresses[0], 202106, 1);
      expect(await ageOf(addresses[0], 202106)).to.approximately(0, 5);
      await network.provider.send("evm_increaseTime", [100]);
      // mint:
      await nft_staked.mint(addresses[0], 202106, 1);
      expect(await ageOf(addresses[0], 202106)).to.approximately(200, 5);
      await network.provider.send("evm_increaseTime", [100]);
      // burn:
      await nft_staked.burn(addresses[0], 202106, 1);
      expect(await ageOf(addresses[0], 202106)).to.approximately(0, 5);
      await network.provider.send("evm_increaseTime", [100]);
      // mint:
      await nft_staked.mint(addresses[0], 202106, 1);
      expect(await ageOf(addresses[0], 202106)).to.approximately(300, 5);
      await network.provider.send("evm_increaseTime", [100]);
      // burn:
      await nft_staked.burn(addresses[0], 202106, 1);
      expect(await ageOf(addresses[0], 202106)).to.approximately(0, 5);
      await network.provider.send("evm_increaseTime", [100]);
      // mint:
      await nft_staked.mint(addresses[0], 202106, 1);
      expect(await ageOf(addresses[0], 202106)).to.approximately(400, 5);
      await network.provider.send("evm_increaseTime", [100]);
      // burn:
      await nft_staked.burn(addresses[0], 202106, 1);
      expect(await ageOf(addresses[0], 202106)).to.approximately(0, 5);
      await network.provider.send("evm_increaseTime", [100]);
    });
  });
  describe("age [mint, mint, burn, burn, ...]", async function () {
    it("should mint/burn nft-staked & check age", async function () {
      expect(await ageOf(addresses[0], 202109)).to.approximately(0, 5);
      // mint:
      await nft_staked.mint(addresses[0], 202109, 1);
      expect(await ageOf(addresses[0], 202109)).to.approximately(0, 5);
      await network.provider.send("evm_increaseTime", [100]);
      await nft_staked.mint(addresses[0], 202109, 1);
      expect(await ageOf(addresses[0], 202109)).to.approximately(50, 5);
      await network.provider.send("evm_increaseTime", [100]);
      // burn:
      await nft_staked.burn(addresses[0], 202109, 1);
      expect(await ageOf(addresses[0], 202109)).to.approximately(300, 5);
      await network.provider.send("evm_increaseTime", [100]);
      await nft_staked.burn(addresses[0], 202109, 1);
      expect(await ageOf(addresses[0], 202109)).to.approximately(0, 5);
      await network.provider.send("evm_increaseTime", [100]);
      // mint:
      await nft_staked.mint(addresses[0], 202109, 1);
      expect(await ageOf(addresses[0], 202109)).to.approximately(400, 5);
      await network.provider.send("evm_increaseTime", [100]);
      await nft_staked.mint(addresses[0], 202109, 1);
      expect(await ageOf(addresses[0], 202109)).to.approximately(250, 5);
      await network.provider.send("evm_increaseTime", [100]);
      // burn:
      await nft_staked.burn(addresses[0], 202109, 1);
      expect(await ageOf(addresses[0], 202109)).to.approximately(700, 5);
      await network.provider.send("evm_increaseTime", [100]);
      await nft_staked.burn(addresses[0], 202109, 1);
      expect(await ageOf(addresses[0], 202109)).to.approximately(0, 5);
      await network.provider.send("evm_increaseTime", [100]);
      // mint:
      await nft_staked.mint(addresses[0], 202109, 1);
      expect(await ageOf(addresses[0], 202109)).to.approximately(800, 5);
      await network.provider.send("evm_increaseTime", [100]);
      await nft_staked.mint(addresses[0], 202109, 1);
      expect(await ageOf(addresses[0], 202109)).to.approximately(450, 5);
      await network.provider.send("evm_increaseTime", [100]);
      // burn:
      await nft_staked.burn(addresses[0], 202109, 1);
      expect(await ageOf(addresses[0], 202109)).to.approximately(1100, 5);
      await network.provider.send("evm_increaseTime", [100]);
      await nft_staked.burn(addresses[0], 202109, 1);
      expect(await ageOf(addresses[0], 202109)).to.approximately(0, 5);
      await network.provider.send("evm_increaseTime", [100]);
    });
  });
  describe("age [mint-batch, burn-batch]", async function () {
    it("should mint/burn nft-staked & check age", async function () {
      expect(await ageOf(addresses[0], 202112)).to.approximately(0, 5);
      // mint-batch:
      await nft_staked.mintBatch(addresses[0], [202100], [1]);
      expect(await ageOf(addresses[0], 202112)).to.approximately(0, 5);
      await network.provider.send("evm_increaseTime", [100]);
      // burn-batch:
      await nft_staked.burnBatch(addresses[0], [202100], [1]);
      expect(await ageOf(addresses[0], 202112)).to.approximately(0, 5);
      await network.provider.send("evm_increaseTime", [100]);
    });
  });
  describe("transfer", async function () {
    it("should transfer nft-staked", async function () {
      const [from, to] = addresses;
      // mint:
      await nft_staked.mint(from, 202200, 1);
      expect(await ageOf(from, 202200)).to.approximately(0, 5);
      expect(await ageOf(to, 202200)).to.approximately(0, 5);
      await network.provider.send("evm_increaseTime", [100]);
      await network.provider.send("evm_mine");
      expect(await ageOf(from, 202200)).to.approximately(100, 5);
      expect(await ageOf(to, 202200)).to.approximately(0, 5);
      await network.provider.send("evm_increaseTime", [100]);
      await network.provider.send("evm_mine");
      expect(await ageOf(from, 202200)).to.approximately(200, 5);
      expect(await ageOf(to, 202200)).to.approximately(0, 5);
      await network.provider.send("evm_increaseTime", [100]);
      await network.provider.send("evm_mine");
      // transfer:
      await transferPpt(from, to, 202200, 1);
      expect(await ageOf(from, 202200)).to.approximately(0, 5);
      expect(await ageOf(to, 202200)).to.approximately(0, 5);
      await network.provider.send("evm_increaseTime", [100]);
      await network.provider.send("evm_mine");
      expect(await ageOf(from, 202200)).to.approximately(0, 5);
      expect(await ageOf(to, 202200)).to.approximately(100, 5);
      await network.provider.send("evm_increaseTime", [100]);
      await network.provider.send("evm_mine");
      expect(await ageOf(from, 202200)).to.approximately(0, 5);
      expect(await ageOf(to, 202200)).to.approximately(200, 5);
      await network.provider.send("evm_increaseTime", [100]);
      await network.provider.send("evm_mine");
      // burn:
      await nft_staked.burn(to, 202200, 1);
      expect(await ageOf(from, 202200)).to.approximately(0, 5);
      expect(await ageOf(to, 202200)).to.approximately(0, 5);
      await network.provider.send("evm_increaseTime", [100]);
      await network.provider.send("evm_mine");
    });
    it("should *not* transfer nft-staked (not token owner or approved)", async function () {
      const [to, from] = addresses; // REVERSED!
      // mint: (for *to* and not *from*!)
      await nft_staked.mint(from, 202200, 1);
      expect(await ageOf(from, 202200)).to.approximately(0, 5);
      expect(await ageOf(to, 202200)).to.approximately(0, 5);
      await network.provider.send("evm_increaseTime", [100]);
      await network.provider.send("evm_mine");
      // transfer:
      const tx_transfer = await nft_staked
        .safeTransferFrom(from, to, 202200, 1, DATA)
        .catch((ex) => {
          const m = ex.message.match(/caller is not token owner or approved/);
          if (m === null) console.debug(ex);
          expect(m).to.be.not.null;
        });
      expect(tx_transfer).to.eq(undefined);
      expect(await ageOf(from, 202200)).to.approximately(100, 5);
      expect(await ageOf(to, 202200)).to.approximately(0, 5);
      await network.provider.send("evm_increaseTime", [100]);
      await network.provider.send("evm_mine");
      // burn:
      await nft_staked.burn(from, 202200, 1);
      expect(await ageOf(from, 202200)).to.approximately(0, 5);
      expect(await ageOf(to, 202200)).to.approximately(0, 5);
      await network.provider.send("evm_increaseTime", [100]);
      await network.provider.send("evm_mine");
    });
  });
  describe("transfer-batch", async function () {
    it("should transfer nft-staked", async function () {
      const [from, to] = addresses;
      // mint:
      await nft_staked.mintBatch(from, [202200], [1]);
      expect(await ageOf(from, 202200)).to.approximately(0, 5);
      expect(await ageOf(to, 202200)).to.approximately(0, 5);
      await network.provider.send("evm_increaseTime", [100]);
      await network.provider.send("evm_mine");
      expect(await ageOf(from, 202200)).to.approximately(100, 5);
      expect(await ageOf(to, 202200)).to.approximately(0, 5);
      await network.provider.send("evm_increaseTime", [100]);
      await network.provider.send("evm_mine");
      expect(await ageOf(from, 202200)).to.approximately(200, 5);
      expect(await ageOf(to, 202200)).to.approximately(0, 5);
      await network.provider.send("evm_increaseTime", [100]);
      await network.provider.send("evm_mine");
      // transfer:
      await batchTransferPpt(from, to, [202200], [1]);
      expect(await ageOf(from, 202200)).to.approximately(0, 5);
      expect(await ageOf(to, 202200)).to.approximately(0, 5);
      await network.provider.send("evm_increaseTime", [100]);
      await network.provider.send("evm_mine");
      expect(await ageOf(from, 202200)).to.approximately(0, 5);
      expect(await ageOf(to, 202200)).to.approximately(100, 5);
      await network.provider.send("evm_increaseTime", [100]);
      await network.provider.send("evm_mine");
      expect(await ageOf(from, 202200)).to.approximately(0, 5);
      expect(await ageOf(to, 202200)).to.approximately(200, 5);
      await network.provider.send("evm_increaseTime", [100]);
      await network.provider.send("evm_mine");
      // burn:
      await nft_staked.burnBatch(to, [202200], [1]);
      expect(await ageOf(from, 202200)).to.approximately(0, 5);
      expect(await ageOf(to, 202200)).to.approximately(0, 5);
      await network.provider.send("evm_increaseTime", [100]);
      await network.provider.send("evm_mine");
    });
    it("should *not* transfer nft-staked (not token owner or approved)", async function () {
      const [to, from] = addresses; // REVERSED!
      // mint: (for *to* and not *from*!)
      await nft_staked.mintBatch(from, [202200], [1]);
      expect(await ageOf(from, 202200)).to.approximately(0, 5);
      expect(await ageOf(to, 202200)).to.approximately(0, 5);
      await network.provider.send("evm_increaseTime", [100]);
      await network.provider.send("evm_mine");
      // transfer:
      const tx_transfer = await nft_staked
        .safeBatchTransferFrom(from, to, [202200], [1], DATA)
        .catch((ex) => {
          const m = ex.message.match(/caller is not token owner or approved/);
          if (m === null) console.debug(ex);
          expect(m).to.be.not.null;
        });
      expect(tx_transfer).to.eq(undefined);
      expect(await ageOf(from, 202200)).to.approximately(100, 5);
      expect(await ageOf(to, 202200)).to.approximately(0, 5);
      await network.provider.send("evm_increaseTime", [100]);
      await network.provider.send("evm_mine");
      // burn:
      await nft_staked.burnBatch(from, [202200], [1]);
      expect(await ageOf(from, 202200)).to.approximately(0, 5);
      expect(await ageOf(to, 202200)).to.approximately(0, 5);
      await network.provider.send("evm_increaseTime", [100]);
      await network.provider.send("evm_mine");
    });
  });
  describe("setURI", function () {
    const NFT_LOKI_WWW = "https://www.xpowermine.com/nfts/loki/{id}.json";
    it("should set new URI", async function () {
      await nft_staked.grantRole(nft_staked.URI_DATA_ROLE(), addresses[0]);
      const nft_year = (await nft_staked.year()).toNumber();
      expect(nft_year).to.be.greaterThan(0);
      const nft_id = (
        await nft_staked.idBy(nft_year, nft_staked.UNIT(), 0)
      ).toNumber();
      expect(nft_id).to.be.greaterThan(0);
      await nft_staked.setURI(NFT_LOKI_WWW);
      const nft_url = await nft_staked.uri(nft_id);
      expect(nft_url).to.eq(NFT_LOKI_WWW);
    });
    it("should *not* set new URI (missing role)", async function () {
      await nft_staked.revokeRole(nft_staked.URI_DATA_ROLE(), addresses[0]);
      const nft_year = (await nft_staked.year()).toNumber();
      expect(nft_year).to.be.greaterThan(0);
      const nft_id = (
        await nft_staked.idBy(nft_year, nft_staked.UNIT(), 0)
      ).toNumber();
      expect(nft_id).to.be.greaterThan(0);
      await nft_staked.transferOwnership(addresses[1]);
      expect(
        await nft_staked.setURI(NFT_LOKI_WWW).catch((ex) => {
          const m = ex.message.match(/account 0x[0-9a-f]+ is missing role/);
          if (m === null) console.debug(ex);
          expect(m).to.be.not.null;
        })
      ).to.eq(undefined);
    });
  });
});
async function mintPpt(nft_id, amount) {
  await nft_staked.mint(addresses[0], nft_id, amount);
  const nft_balance = await nft_staked.balanceOf(addresses[0], nft_id);
  expect(nft_balance).to.eq(amount);
  const nft_supply = await nft_staked.totalSupply(nft_id);
  expect(nft_supply).to.eq(amount);
  const nft_exists = await nft_staked.exists(nft_id);
  expect(nft_exists).to.eq(nft_balance.gt(0));
}
async function burnPpt(nft_id, amount) {
  const nft_balance_old = await nft_staked.balanceOf(addresses[0], nft_id);
  expect(nft_balance_old.gte(amount)).be.eq(true);
  const nft_supply_old = await nft_staked.totalSupply(nft_id);
  expect(nft_supply_old.gte(amount)).to.eq(true);
  await nft_staked.burn(addresses[0], nft_id, amount);
  const nft_balance = await nft_staked.balanceOf(addresses[0], nft_id);
  expect(nft_balance).to.eq(nft_balance_old.sub(amount));
  const nft_supply = await nft_staked.totalSupply(nft_id);
  expect(nft_supply).to.eq(nft_supply_old.sub(amount));
  const nft_exists = await nft_staked.exists(nft_id);
  expect(nft_exists).to.eq(nft_balance_old.sub(amount).gt(0));
}
async function mintBatchPpt(nft_id, amount) {
  await nft_staked.mintBatch(addresses[0], [nft_id], [amount]);
  const nft_balance = await nft_staked.balanceOf(addresses[0], nft_id);
  expect(nft_balance).to.eq(amount);
  const nft_supply = await nft_staked.totalSupply(nft_id);
  expect(nft_supply).to.eq(amount);
  const nft_exists = await nft_staked.exists(nft_id);
  expect(nft_exists).to.eq(nft_balance.gt(0));
}
async function burnBatchPpt(nft_id, amount) {
  const nft_balance_old = await nft_staked.balanceOf(addresses[0], nft_id);
  expect(nft_balance_old.gte(amount)).be.eq(true);
  const nft_supply_old = await nft_staked.totalSupply(nft_id);
  expect(nft_supply_old.gte(amount)).be.eq(true);
  await nft_staked.burnBatch(addresses[0], [nft_id], [amount]);
  const nft_balance = await nft_staked.balanceOf(addresses[0], nft_id);
  expect(nft_balance).to.eq(nft_balance_old.sub(amount));
  const nft_supply = await nft_staked.totalSupply(nft_id);
  expect(nft_supply).to.eq(nft_supply_old.sub(amount));
  const nft_exists = await nft_staked.exists(nft_id);
  expect(nft_exists).to.eq(nft_balance_old.sub(amount).gt(0));
}
async function transferPpt(from, to, nft_id, amount) {
  const from_old = await nft_staked.balanceOf(from, nft_id);
  const to_old = await nft_staked.balanceOf(to, nft_id);
  await nft_staked.safeTransferFrom(from, to, nft_id, amount, DATA);
  const from_new = await nft_staked.balanceOf(from, nft_id);
  const to_new = await nft_staked.balanceOf(to, nft_id);
  expect(from_old.sub(amount)).to.eq(from_new);
  expect(to_old.add(amount)).to.eq(to_new);
}
async function batchTransferPpt(from, to, nft_ids, amounts) {
  const from_olds = await nft_staked.balanceOfBatch([from], nft_ids);
  const to_olds = await nft_staked.balanceOfBatch([to], nft_ids);
  await nft_staked.safeBatchTransferFrom(from, to, nft_ids, amounts, DATA);
  const from_news = await nft_staked.balanceOfBatch([from], nft_ids);
  const to_news = await nft_staked.balanceOfBatch([to], nft_ids);
  for (let i = 0; i < amounts.length; i++) {
    expect(from_olds[i].sub(amounts[i])).to.eq(from_news[i]);
    expect(to_olds[i].add(amounts[i])).to.eq(to_news[i]);
  }
}
async function ageOf(account, nft_id) {
  const age = await nft_staked.ageOf(account, nft_id);
  const balance = await nft_staked.balanceOf(account, nft_id);
  if (balance.gt(0)) {
    return Number(age.toBigInt() / balance.toBigInt());
  }
  return 0;
}
