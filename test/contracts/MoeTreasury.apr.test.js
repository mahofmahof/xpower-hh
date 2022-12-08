/* eslint no-unused-expressions: [off] */
/* eslint no-unused-vars: [off] */
const { expect } = require("chai");
const { ethers, network } = require("hardhat");

let accounts; // all accounts
let addresses; // all addresses
let APower, XPower, Nft, Ppt, NftTreasury, MoeTreasury; // contracts
let apower, xpower, nft, nft_staked, nft_treasury, moe_treasury; // instances

const NFT_ODIN_URL = "https://xpowermine.com/nfts/odin/{id}.json";
const DEADLINE = 126_230_400; // [seconds] i.e. 4 years
const DAYS = 86_400; // [seconds]

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
    APower = await ethers.getContractFactory("APowerOdin");
    expect(APower).to.exist;
    XPower = await ethers.getContractFactory("XPowerOdinTest");
    expect(XPower).to.exist;
  });
  before(async function () {
    Nft = await ethers.getContractFactory("XPowerOdinNft");
    expect(Nft).to.exist;
    Ppt = await ethers.getContractFactory("XPowerOdinPpt");
    expect(Ppt).to.exist;
    NftTreasury = await ethers.getContractFactory("NftTreasury");
    expect(NftTreasury).to.exist;
    MoeTreasury = await ethers.getContractFactory("MoeTreasury");
    expect(MoeTreasury).to.exist;
  });
  before(async function () {
    xpower = await XPower.deploy([], DEADLINE);
    expect(xpower).to.exist;
    await xpower.deployed();
    await xpower.init();
  });
  before(async function () {
    apower = await APower.deploy(xpower.address, [], DEADLINE);
    expect(apower).to.exist;
    await apower.deployed();
  });
  before(async function () {
    nft = await Nft.deploy(NFT_ODIN_URL, xpower.address, [], DEADLINE);
    expect(nft).to.exist;
    await nft.deployed();
  });
  before(async function () {
    nft_staked = await Ppt.deploy(NFT_ODIN_URL, [], DEADLINE);
    expect(nft_staked).to.exist;
    await nft_staked.deployed();
  });
  before(async function () {
    nft_treasury = await NftTreasury.deploy(nft.address, nft_staked.address);
    expect(nft_treasury).to.exist;
    await nft_treasury.deployed();
  });
  before(async function () {
    moe_treasury = await MoeTreasury.deploy(
      apower.address,
      xpower.address,
      nft_staked.address
    );
    expect(moe_treasury).to.exist;
    await moe_treasury.deployed();
  });
  before(async function () {
    await apower.transferOwnership(moe_treasury.address);
    expect(await apower.owner()).to.eq(moe_treasury.address);
  });
  describe("apr (i.e rewards ~ age^1.0)", async function () {
    it("should return 0.000[%] for nft-level=00", async function () {
      expect(await moe_treasury.aprOf(202100)).to.eq(0);
      expect(await moe_treasury.aprOf(202200)).to.eq(0);
    });
    it("should return 1.000[%] for nft-level=03", async function () {
      expect(await moe_treasury.aprOf(202103)).to.eq(1_000);
      expect(await moe_treasury.aprOf(202203)).to.eq(1_000);
    });
    it("should return 2.000[%] for nft-level=06", async function () {
      expect(await moe_treasury.aprOf(202106)).to.eq(2_000);
      expect(await moe_treasury.aprOf(202206)).to.eq(2_000);
    });
    it("should return 3.000[%] for nft-level=09", async function () {
      expect(await moe_treasury.aprOf(202109)).to.eq(3_000);
      expect(await moe_treasury.aprOf(202209)).to.eq(3_000);
    });
    it("should return 4.000[%] for nft-level=12", async function () {
      expect(await moe_treasury.aprOf(202112)).to.eq(4_000);
      expect(await moe_treasury.aprOf(202212)).to.eq(4_000);
    });
    it("should return 5.000[%] for nft-level=15", async function () {
      expect(await moe_treasury.aprOf(202115)).to.eq(5_000);
      expect(await moe_treasury.aprOf(202215)).to.eq(5_000);
    });
    it("should return 6.000[%] for nft-level=18", async function () {
      expect(await moe_treasury.aprOf(202118)).to.eq(6_000);
      expect(await moe_treasury.aprOf(202218)).to.eq(6_000);
    });
    it("should return 7.000[%] for nft-level=21", async function () {
      expect(await moe_treasury.aprOf(202121)).to.eq(7_000);
      expect(await moe_treasury.aprOf(202221)).to.eq(7_000);
    });
    it("should return 8.000[%] for nft-level=24", async function () {
      expect(await moe_treasury.aprOf(202124)).to.eq(8_000);
      expect(await moe_treasury.aprOf(202224)).to.eq(8_000);
    });
  });
  describe("apr-bonus (i.e rewards ~ age.year^2.0)", async function () {
    const full_year = new Date().getFullYear();
    const positive = (n) => (n > 0 ? n : 0);
    for (let dy = 0; dy < 10; dy++) {
      for (let y = 2021; y < 2031; y++) {
        const now_year = dy + full_year;
        const rate = positive(now_year - y) * 10;
        const rate_padded = String(rate).padStart(3, "0");
        it(`should return 0.${rate_padded}[%] for nft-year=${y} & now-year=${now_year}`, async () => {
          expect(await moe_treasury.aprBonusOf(nft.idBy(y, 0))).to.eq(rate);
          expect(await moe_treasury.aprBonusOf(nft.idBy(y, 3))).to.eq(rate);
          expect(await moe_treasury.aprBonusOf(nft.idBy(y, 6))).to.eq(rate);
          expect(await moe_treasury.aprBonusOf(nft.idBy(y, 9))).to.eq(rate);
          expect(await moe_treasury.aprBonusOf(nft.idBy(y, 12))).to.eq(rate);
          expect(await moe_treasury.aprBonusOf(nft.idBy(y, 15))).to.eq(rate);
          expect(await moe_treasury.aprBonusOf(nft.idBy(y, 18))).to.eq(rate);
          expect(await moe_treasury.aprBonusOf(nft.idBy(y, 21))).to.eq(rate);
          expect(await moe_treasury.aprBonusOf(nft.idBy(y, 24))).to.eq(rate);
        });
      }
      it(`should forward time by one year`, async function () {
        await network.provider.send("evm_increaseTime", [365.25 * DAYS]);
        await network.provider.send("evm_mine", []);
      });
    }
  });
});
