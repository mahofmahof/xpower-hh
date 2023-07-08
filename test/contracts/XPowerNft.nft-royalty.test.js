/* eslint no-unused-expressions: [off] */
/* eslint no-unused-vars: [off] */
const { expect } = require("chai");
const { ethers, network } = require("hardhat");

let accounts; // all accounts
let addresses; // all addresses
let Moe, Nft; // contracts
let moe, nft; // instances

const NFT_LOKI_URL = "https://xpowermine.com/nfts/loki/{id}.json";
const SOME_ADDRESS = /^0x[0-fa-f]{40}$/i;
const DEADLINE = 0; // [seconds]

describe("XPowerNft", async function () {
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
    Nft = await ethers.getContractFactory("XPowerNft");
    expect(Nft).to.exist;
    Moe = await ethers.getContractFactory("XPowerLoki");
    expect(Moe).to.exist;
  });
  beforeEach(async function () {
    moe = await Moe.deploy([], DEADLINE);
    expect(moe).to.exist;
    await moe.deployed();
    await moe.transferOwnership(addresses[1]);
    await moe.init();
  });
  beforeEach(async function () {
    nft = await Nft.deploy(NFT_LOKI_URL, [moe.address], [], DEADLINE);
    expect(nft).to.exist;
    await nft.deployed();
  });
  after(async function () {
    const [owner, signer_1] = await ethers.getSigners();
    await moe.connect(signer_1).transferOwnership(owner.address);
  });
  describe("royaltyInfo", function () {
    const level = (l) => {
      return l.toString().padStart(2, "0");
    };
    const amount = () => {
      return 50; // 0.5%
    };
    for (const l of [0, 3, 6, 9, 12, 15, 18, 21, 24]) {
      it(`should get info for 22023${level(l)} of ${amount()}`, async () => {
        const [b, a] = await nft.royaltyInfo(2202300 + l, 10_000);
        expect(b).to.match(SOME_ADDRESS);
        expect(a).to.equal(amount(l));
      });
      it(`should get info for 22022${level(l)} of ${amount()}`, async () => {
        const [b, a] = await nft.royaltyInfo(2202200 + l, 10_000);
        expect(b).to.match(SOME_ADDRESS);
        expect(a).to.equal(amount(l));
      });
      it(`should get info for 22021${level(l)} of ${amount()}`, async () => {
        const [b, a] = await nft.royaltyInfo(3202100 + l, 10_000);
        expect(b).to.match(SOME_ADDRESS);
        expect(a).to.equal(amount(l));
      });
    }
  });
  describe("setRoyal", function () {
    it("should set new default royalty beneficiary", async function () {
      await nft.grantRole(nft.NFT_ROYAL_ROLE(), addresses[0]);
      await nft.setRoyal(1, addresses[1]);
      const royal = await nft.getRoyal(1);
      expect(royal).to.eq(addresses[1]);
    });
    it("should *not* set new default royalty beneficiary (missing role)", async function () {
      await nft.revokeRole(nft.NFT_ROYAL_ROLE(), addresses[0]);
      await nft.transferOwnership(addresses[1]);
      expect(
        await nft.setRoyal(1, addresses[1]).catch((ex) => {
          const m = ex.message.match(/account 0x[0-9a-f]+ is missing role/);
          if (m === null) console.debug(ex);
          expect(m).to.be.not.null;
        })
      ).to.eq(undefined);
    });
  });
  describe("setRoyalBatch", function () {
    it("should set new default royalty beneficiaries", async function () {
      await nft.grantRole(nft.NFT_ROYAL_ROLE(), addresses[0]);
      await nft.setRoyalBatch([1, 2, 3], addresses[1]);
      const royal_1 = await nft.getRoyal(1);
      expect(royal_1).to.eq(addresses[1]);
      const royal_2 = await nft.getRoyal(2);
      expect(royal_2).to.eq(addresses[1]);
      const royal_3 = await nft.getRoyal(3);
      expect(royal_3).to.eq(addresses[1]);
    });
    it("should *not* set new default royalty beneficiary (missing role)", async function () {
      await nft.revokeRole(nft.NFT_ROYAL_ROLE(), addresses[0]);
      await nft.transferOwnership(addresses[1]);
      expect(
        await nft.setRoyalBatch([1], addresses[1]).catch((ex) => {
          const m = ex.message.match(/account 0x[0-9a-f]+ is missing role/);
          if (m === null) console.debug(ex);
          expect(m).to.be.not.null;
        })
      ).to.eq(undefined);
    });
  });
});
