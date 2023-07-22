/**
 * We require the Hardhat Runtime Environment (HRE) explicitly here: The import
 * is optional but useful for running a script in a standalone fashion through:
 *
 * $ node <script>
 *
 * When running the script via `npx hardhat run <script>` you'll find the HRE's
 * members available in the global scope.
 */
const assert = require("assert");
const { wait } = require("../wait");
const { ethers } = require("hardhat");

/**
 * Hardhat *always* runs the compile task when running scripts with its command
 * line interface. But, if this script is run *directly* using `node`, then you
 * may want to call compile manually to make sure everything is compiled:
 *
 * > await hre.run('compile');
 */
async function main() {
  // addresses XPower[New]
  const xpow_moe_link = process.env.XPOW_MOE_V5c;
  assert(xpow_moe_link, "missing XPOW_MOE_V5c");
  // addresses APower[New]
  const xpow_sov_link = process.env.XPOW_SOV_V5c;
  assert(xpow_sov_link, "missing XPOW_SOV_V5c");
  // addresses XPowerPpt[New]
  const xpow_ppt_link = process.env.XPOW_PPT_V5c;
  assert(xpow_ppt_link, "missing XPOW_PPT_V5c");
  //
  // deploy XPOW NftTreasury[New] & re-own APower[New]:
  //
  const { mty } = await deploy("MoeTreasury", {
    moe_link: xpow_moe_link,
    sov_link: xpow_sov_link,
    ppt_link: xpow_ppt_link,
  });
  await transfer("APower", {
    sov_link: xpow_sov_link,
    treasury: mty,
  });
  console.log(`XPOW_MTY_V5c=${mty.target}`);
}
async function deploy(mty_name, { moe_link, sov_link, ppt_link }) {
  const factory = await ethers.getContractFactory(mty_name);
  const contract = await factory.deploy(moe_link, sov_link, ppt_link);
  await wait(contract);
  return { mty: contract };
}
async function transfer(sov_name, { sov_link, treasury }) {
  const factory = await ethers.getContractFactory(sov_name);
  const contract = factory.attach(sov_link);
  const transfer = await contract.transferOwnership(treasury.target);
  await wait(transfer);
}
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
exports.main = main;
