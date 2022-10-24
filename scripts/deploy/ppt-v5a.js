/**
 * We require the Hardhat Runtime Environment (HRE) explicitly here: The import
 * is optional but useful for running a script in a standalone fashion through:
 *
 * $ node <script>
 *
 * When running the script via `npx hardhat run <script>` you'll find the HRE's
 * members available in the global scope.
 */
const hre = require("hardhat");
const assert = require("assert");
const { wait } = require("../wait");

/**
 * Hardhat *always* runs the compile task when running scripts with its command
 * line interface. But, if this script is run *directly* using `node`, then you
 * may want to call compile manually to make sure everything is compiled:
 *
 * > await hre.run('compile');
 */
async function main() {
  const owner = process.env.FUND_ADDRESS;
  assert(owner, "missing FUND_ADDRESS");
  // addresses XPowerNftStaked[Old]
  const thor_ppt_base = process.env.THOR_NFT_V4a;
  assert(thor_ppt_base, "missing THOR_NFT_V4a");
  const loki_ppt_base = process.env.LOKI_NFT_V4a;
  assert(loki_ppt_base, "missing LOKI_NFT_V4a");
  const odin_ppt_base = process.env.ODIN_NFT_V4a;
  assert(odin_ppt_base, "missing ODIN_NFT_V4a");
  // addresses XPowerNftStaked[Uri]
  const thor_ppt_uri = process.env.THOR_PPT_URI;
  assert(thor_ppt_uri, "missing THOR_PPT_URI");
  const loki_ppt_uri = process.env.LOKI_PPT_URI;
  assert(loki_ppt_uri, "missing LOKI_PPT_URI");
  const odin_ppt_uri = process.env.ODIN_PPT_URI;
  assert(odin_ppt_uri, "missing ODIN_PPT_URI");
  // migration:
  const deadline = 126_230_400; // 4 years
  //
  // deploy XPowerThorNftStaked[New]:
  //
  const thor_nft = await deploy("XPowerThorNftStaked", {
    ppt_base: thor_ppt_base,
    ppt_uri: thor_ppt_uri,
    deadline,
  });
  console.log(`THOR_PPT_V5a=${thor_nft.address}`);
  //
  // deploy XPowerLokiNftStaked[New]:
  //
  const loki_nft = await deploy("XPowerLokiNftStaked", {
    ppt_base: loki_ppt_base,
    ppt_uri: loki_ppt_uri,
    deadline,
  });
  console.log(`LOKI_PPT_V5a=${loki_nft.address}`);
  //
  // deploy XPowerOdinNftStaked[New]:
  //
  const odin_nft = await deploy("XPowerOdinNftStaked", {
    ppt_base: odin_ppt_base,
    ppt_uri: odin_ppt_uri,
    deadline,
  });
  console.log(`ODIN_PPT_V5a=${odin_nft.address}`);
}
async function deploy(name, { ppt_base, ppt_uri, deadline }) {
  const factory = await hre.ethers.getContractFactory(name);
  const contract = await factory.deploy(ppt_base, ppt_uri, deadline);
  await wait(contract.deployTransaction);
  return contract;
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
