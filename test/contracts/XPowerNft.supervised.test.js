/* eslint no-unused-expressions: [off] */
/* eslint no-unused-vars: [off] */
const { expect } = require("chai");
const { ethers, network } = require("hardhat");

let accounts; // all accounts
let addresses; // all addresses
let Moe, Nft; // contracts
let moe, nft; // instances

const NFT_ODIN_URL = "https://xpowermine.com/nfts/loki/{id}.json";
const DEADLINE = 126_230_400; // [seconds] i.e. 4 years

describe("XPowerNftSupervised", async function () {
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
    Moe = await ethers.getContractFactory("XPowerLokiTest");
    expect(Moe).to.exist;
  });
  before(async function () {
    Nft = await ethers.getContractFactory("XPowerNft");
    expect(Nft).to.exist;
  });
  before(async function () {
    moe = await Moe.deploy([], DEADLINE);
    expect(moe).to.exist;
    await moe.deployed();
  });
  before(async function () {
    nft = await Nft.deploy(NFT_ODIN_URL, [moe.address], [], DEADLINE);
    expect(nft).to.exist;
    await nft.deployed();
  });
  it("should grant & revoke NFT_OPEN_ROLE", async function () {
    const role = await has_role(nft.NFT_OPEN_ROLE(), {
      has: false,
    });
    await grant_role(role, { granted: true });
    await revoke_role(role, { revoked: true });
  });
  it("should revoke & grant NFT_OPEN_ADMIN_ROLE", async function () {
    const role = await has_role(nft.NFT_OPEN_ADMIN_ROLE(), {
      has: true,
    });
    await revoke_role(role, { revoked: true });
    await grant_role(role, { granted: true });
  });
  it("should grant & revoke NFT_SEAL_ROLE", async function () {
    const role = await has_role(nft.NFT_SEAL_ROLE(), {
      has: false,
    });
    await grant_role(role, { granted: true });
    await revoke_role(role, { revoked: true });
  });
  it("should revoke & grant NFT_SEAL_ADMIN_ROLE", async function () {
    const role = await has_role(nft.NFT_SEAL_ADMIN_ROLE(), {
      has: true,
    });
    await revoke_role(role, { revoked: true });
    await grant_role(role, { granted: true });
  });
  it("should grant & revoke NFT_ROYAL_ROLE", async function () {
    const role = await has_role(nft.NFT_ROYAL_ROLE(), {
      has: false,
    });
    await grant_role(role, { granted: true });
    await revoke_role(role, { revoked: true });
  });
  it("should revoke & grant NFT_ROYAL_ADMIN_ROLE", async function () {
    const role = await has_role(nft.NFT_ROYAL_ADMIN_ROLE(), {
      has: true,
    });
    await revoke_role(role, { revoked: true });
    await grant_role(role, { granted: true });
  });
  it("should grant & revoke URI_DATA_ROLE", async function () {
    const role = await has_role(nft.URI_DATA_ROLE(), {
      has: false,
    });
    await grant_role(role, { granted: true });
    await revoke_role(role, { revoked: true });
  });
  it("should revoke & grant URI_DATA_ADMIN_ROLE", async function () {
    const role = await has_role(nft.URI_DATA_ADMIN_ROLE(), {
      has: true,
    });
    await revoke_role(role, { revoked: true });
    await grant_role(role, { granted: true });
  });
  it("should transfer DEFAULT_ADMIN_ROLE", async function () {
    const role = await has_role(nft.DEFAULT_ADMIN_ROLE(), {
      has: true,
    });
    await grant_role(role, { granted: true, address: addresses[1] });
    await has_role(role, { has: true, address: addresses[1] });
    await revoke_role(role, { revoked: true });
    await grant_role(role, { granted: false });
  });
});
async function revoke_role(role, { revoked, address }) {
  await nft.revokeRole(role, address ?? addresses[0]);
  await has_role(role, { has: !revoked });
}
async function grant_role(role, { granted, address }) {
  if (granted) {
    await nft.grantRole(role, address ?? addresses[0]);
  } else {
    await nft.grantRole(role, address ?? addresses[0]).catch((ex) => {
      const m = ex.message.match(/account 0x[0-9a-f]+ is missing role/);
      if (m === null) console.debug(ex);
      expect(m).to.be.not.null;
    });
  }
  await has_role(role, { has: granted, address });
}
async function has_role(role, { has, address }) {
  const my_role = await role;
  const has_role = await nft.hasRole(my_role, address ?? addresses[0]);
  expect(has_role).to.eq(has);
  return my_role;
}
