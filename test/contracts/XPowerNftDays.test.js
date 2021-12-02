/* eslint no-unused-expressions: [off] */
/* eslint no-unused-vars: [off] */
const { expect } = require("chai");
const { ethers, network } = require("hardhat");

let accounts; // all accounts
let addresses; // all addresses
let XPower, XPowerNft; // contracts
let xpower, xpower_nft; // instances

const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
const NFT_GPU_URL = "https://xpowermine.com/nfts/gpu/{id}.json";
const DEADLINE = 0; // [seconds]

const moment = require("moment");

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
    XPowerNft = await ethers.getContractFactory("XPowerGpuNftTest");
    expect(XPowerNft).to.exist;
    XPower = await ethers.getContractFactory("XPowerGpu");
    expect(XPower).to.exist;
  });
  beforeEach(async function () {
    xpower = await XPower.deploy(NULL_ADDRESS, DEADLINE);
    expect(xpower).to.exist;
    await xpower.deployed();
    await xpower.transferOwnership(addresses[1]);
  });
  beforeEach(async function () {
    xpower_nft = await XPowerNft.deploy(
      NFT_GPU_URL,
      xpower.address,
      NULL_ADDRESS
    );
    expect(xpower_nft).to.exist;
    await xpower_nft.deployed();
  });
  after(async function () {
    const [owner, signer_1] = await ethers.getSigners();
    await xpower.connect(signer_1).transferOwnership(owner.address);
  });
  describe("year (by days)", async function () {
    beforeEach(async () => {
      await network.provider.send("evm_increaseTime", [86400]);
    });
    for (const dd of range(0, 365)) {
      it(`should match current UTC year + ${dd} days`, async () => {
        await check_day(dd);
      });
    }
  });
});
async function check_day(delta) {
  const nft_year = (await xpower_nft.year()).toNumber();
  expect(nft_year).to.be.greaterThan(0);
  const utc_date = moment().add(delta, "days");
  expect(nft_year).to.eq(utc_date.year());
}
function* range(start, end) {
  for (let i = start; i < end; i++) {
    yield i;
  }
}
