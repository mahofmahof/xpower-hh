/* eslint no-unused-expressions: [off] */
/* eslint no-unused-vars: [off] */
const { expect } = require("chai");
const { ethers, network } = require("hardhat");

let accounts; // all accounts
let addresses; // all addresses
let Moe, Sov, Nft, Ppt, Mty, Nty; // contracts
let moe, sov, nft, ppt, mty, nty; // instances

const NFT_XPOW_URL = "https://xpowermine.com/nfts/xpow/{id}.json";
const DEADLINE = 126_230_400; // [seconds] i.e. 4 years
const MONTH = 2_629_800; // [seconds]

describe("MoeTreasury", async function () {
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
    Moe = await ethers.getContractFactory("XPowerTest");
    expect(Moe).to.exist;
    Sov = await ethers.getContractFactory("APower");
    expect(Sov).to.exist;
    Nft = await ethers.getContractFactory("XPowerNft");
    expect(Nft).to.exist;
    Ppt = await ethers.getContractFactory("XPowerPpt");
    expect(Ppt).to.exist;
    Mty = await ethers.getContractFactory("MoeTreasury");
    expect(Mty).to.exist;
    Nty = await ethers.getContractFactory("NftTreasury");
    expect(Nty).to.exist;
  });
  before(async function () {
    moe = await Moe.deploy([], DEADLINE);
    expect(moe).to.exist;
    await moe.deployed();
    await moe.init();
    sov = await Sov.deploy(moe.address, [], DEADLINE);
    expect(sov).to.exist;
    await sov.deployed();
  });
  before(async function () {
    nft = await Nft.deploy(moe.address, NFT_XPOW_URL, [], DEADLINE);
    expect(nft).to.exist;
    await nft.deployed();
    ppt = await Ppt.deploy(NFT_XPOW_URL, [], DEADLINE);
    expect(ppt).to.exist;
    await ppt.deployed();
  });
  before(async function () {
    mty = await Mty.deploy(moe.address, sov.address, ppt.address);
    expect(mty).to.exist;
    await mty.deployed();
    nty = await Nty.deploy(nft.address, ppt.address, mty.address);
    expect(nty).to.exist;
    await nty.deployed();
  });
  before(async function () {
    await sov.transferOwnership(mty.address);
    expect(await sov.owner()).to.eq(mty.address);
  });
  describe("grant-role", async function () {
    it(`should grant reparametrization right`, async function () {
      await mty.grantRole(mty.APB_ROLE(), addresses[0]);
    });
  });
  describe("set-apb", async function () {
    it("should reparameterize at 0.010000[%] (per nft.year)", async function () {
      const tx = await mty.setAPBBatch([202103], [0, 1, 0.01e6, 8]);
      expect(tx).be.an("object");
    });
    it("should forward time by one month", async function () {
      await network.provider.send("evm_increaseTime", [MONTH]);
      await network.provider.send("evm_mine", []);
    });
  });
  describe("set-apb", async function () {
    it("should reparameterize at 0.020000[%] (per nft.year)", async function () {
      const tx = await mty.setAPBBatch([202103], [0, 1, 0.02e6, 8]);
      expect(tx).be.an("object");
    });
    for (let m = 1; m <= 24 * 4; m++) {
      it("should print current & target values", async function () {
        const nft_id = await nft.idBy(new Date().getFullYear() - 1, 3);
        const tgt = Numbers(await mty.apbTargetOf(nft_id));
        const apb = Numbers(await mty.apbOf(nft_id));
        console.debug("[APB]", m, apb, tgt);
      });
      it("should forward time by one month", async function () {
        await network.provider.send("evm_increaseTime", [MONTH / 4]);
        await network.provider.send("evm_mine", []);
      });
    }
  });
});
function Numbers(big_numbers) {
  return big_numbers.map((bn) => bn.toNumber());
}
