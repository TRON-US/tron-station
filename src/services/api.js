import TronWeb from "tronweb";
import netRouter from "services/netRouter.js";
import httpProvider from "services/httpProvider.js";
import Util from "utils/utils.js";
import { nets } from "config/netConfig.js"
import _ from "lodash";

const dataProcessUrl = nets.Dataprocess.url

function AccountResource() {
  return {
    balance: 0,
    balanceEnergy: 0,
    energyLimit: 0,
    energyUsed: 0,
    totalEnergyLimit: 0,
    totalEnergyWeight: 0,
    remainEnergyLimit: 0,
    feeLimit: 0,
    feeLimitEnergy: 0,
    maxEnergyLimit: 0,
    freeBandWidthLimit: 0,
    freeBandWidthUsed: 0,
    bandWidthLimit: 0,
    bandWidthUsed: 0,
    totalBandWidthLimit: 0,
    totalBandWidthWeight: 0,
    maxBandWidthLimit: 0,
    ratio: 0,
    energyFee: 0,
    msg: '',
    status: 0
  };
}

function Witness() {
  return {
    rank: "",
    address: "",
    name: "",
    url: "",
    votes: 0,
    votesdiff: 0,
    votesPercentage: 0,
    voteReward: 0,
    blockReward: 0,
    totalReward: 0,
    totalProduced: 0,
    totalMissed: 0
  };
}

class Api {
  constructor() {
    this._net = netRouter.getNet();
    this._tronWeb = new TronWeb(
      this._net.fullNode,
      this._net.solidityNode,
      this._net.eventServer
    );
    this._tronWeb.setDefaultBlock("latest");
  }

  setUpTronWeb() {
    this._net = netRouter.getNet();
    this._tronWeb = new TronWeb(
      this._net.fullNode,
      this._net.solidityNode,
      this._net.eventServer
    );
    this._tronWeb.setDefaultBlock("latest");
  }

  _filterData(val) {
    return val === undefined ? 0 : val;
  }

  async getLastUpdateBlock(address) {
    if (!address) {
      address = this._net.defaultAddress;
    }
    const block = await this._tronWeb.trx.getCurrentBlock();
    return block.block_header.raw_data.number;
  }

  async getAccount(address) {
    return this._tronWeb.trx.getAccount(address);
  }

  async getAccountResources(address) {
    if (!address) {
      address = this._net.defaultAddress;
    }
    return await this._tronWeb.trx.getAccountResources(address);
  }

  async getChainParametersByName(name) {
    let response = await httpProvider.post(
      this._net.fullNode + "/wallet/getchainparameters"
    );
    let proposals = JSON.parse(response)["chainParameter"];
    let filterProposals = _.filter(proposals, ["key", name]);
    if (filterProposals.length === 0) {
      return "";
    } else {
      return filterProposals[0]["value"];
    }
  }

  async getFrozenEnergy(trx) {
    const resource = await this.getAccountResources();
    let totalEnergyLimit = await this.getChainParametersByName(
      "getTotalEnergyLimit"
    );
    // totalEnergyLimit = totalEnergyLimit === "" ? 50000000000 : totalEnergyLimit;
    let energy = (trx * totalEnergyLimit) / resource.TotalEnergyWeight;
    resource.TotalEnergyLimit = totalEnergyLimit;
    let energyPrice = (10e5 * resource.TotalEnergyWeight / totalEnergyLimit).toFixed(2);
    return { energy: energy, accountResource: resource, energyPrice:  energyPrice};
  }

  async getBurnEnergy(trx) {
    const energyFee = await this.getChainParametersByName("getEnergyFee");
    let energy = trx * 10e5 / energyFee;
    return { energy: energy, energyFee: energyFee };
  }

  async getMaxEnergyLimit(address, feeLimit) {
    let ar = new AccountResource();
    let account;
    try {
      account = await this._tronWeb.trx.getAccount(address);
      if (account.balance === undefined) {
        account.balance = 0;
      }
    } catch(e) {
      console.log(e);
      ar.msg = e;
      ar.status = 1;
      return ar;
    }
    const res = await this.getAccountResources(address);
    let totalEnergyLimit = await this.getChainParametersByName(
      "getTotalEnergyLimit"
    );
    totalEnergyLimit = totalEnergyLimit === "" ? 50000000000 : totalEnergyLimit;
    let energyFee = await this.getChainParametersByName("getEnergyFee");
    const ratio = totalEnergyLimit / res.TotalEnergyWeight;

    // remaining energy limit
    ar.balance = this._filterData(account.balance);
    ar.balanceEnergy = this._filterData(account.balance) / energyFee;
    ar.energyLimit = this._filterData(res.EnergyLimit); // trx
    ar.energyUsed = this._filterData(res.EnergyUsed);
    ar.remainEnergyLimit = ar.energyLimit + ar.balanceEnergy - ar.energyUsed;

    // feelimit energy
    ar.feeLimit = feeLimit;
    ar.feeLimitEnergy = (feeLimit * ratio).toFixed(4);

    // max energy limit
    if (ar.energyLimit > ar.feeLimitEnergy) {
      ar.maxEnergyLimit = Math.min(ar.remainEnergyLimit, ar.feeLimitEnergy);
    } else {
      ar.maxEnergyLimit = ar.remainEnergyLimit;
    }

    ar.maxEnergyLimit = ar.maxEnergyLimit.toLocaleString();

    ar.totalEnergyLimit = totalEnergyLimit;
    ar.totalEnergyWeight = res.TotalEnergyWeight;
    ar.ratio = ratio.toFixed(4);
    ar.energyFee = energyFee;

    return ar;
  }

  async getFrozenBandwidth(trx) {
    const resource = await this.getAccountResources();
    let bp =
      "TotalNetWeight" in resource
        ? (trx * resource.TotalNetLimit) / resource.TotalNetWeight
        : 0;
    let bpPrice = "TotalNetWeight" in resource 
        ? (10e5 * resource.TotalNetWeight / resource.TotalNetLimit).toFixed(2)
        : 0;
    return { bp: bp, accountResource: resource, bpPrice: bpPrice };
  }

  async getMaxBandWidthLimit(address) {
    let ar = new AccountResource();
    let account;
    try {
      account = await this._tronWeb.trx.getAccount(address);
    } catch(e) {
      console.log(e);
      ar.msg = e;
      ar.status = 1;
      return ar;
    }
    if (account.balance === undefined) {
      account.balance = 0;
    }
    const res = await this._tronWeb.trx.getAccountResources(address);
    const ratio = res.TotalNetLimit / res.TotalNetWeight;

    // remaining bp limit
    ar.balance = this._filterData(account.balance) / 1000000; // trx
    ar.freeBandWidthLimit = this._filterData(res.freeNetLimit);
    ar.freeBandWidthUsed = this._filterData(res.freeNetUsed);
    ar.bandWidthLimit = this._filterData(res.NetLimit);
    ar.bandWidthUsed = this._filterData(res.NetUsed);
    ar.maxBandWidthLimit = (
      ar.freeBandWidthLimit +
      ar.bandWidthLimit -
      ar.freeBandWidthUsed -
      ar.bandWidthUsed
    ).toLocaleString();

    ar.totalBandWidthLimit = res.TotalNetLimit;
    ar.totalBandWidthWeight = res.TotalNetWeight;
    ar.ratio = ratio.toFixed(4);

    return ar;
  }

  async getSuperRepresentatives() {
    const srs = await this._tronWeb.trx.listSuperRepresentatives();
    let data = [];
    let srData = [];
    let candidateData = [];
    let top10Sr = [];
    let totalVotes = _.sumBy(srs, sr => {
      return sr.voteCount;
    });
    let totalVoteReward = 16 * 20 * 60 * 24;
    let totalBlockReward = 2 * totalVoteReward;
    let srAmount = netRouter.isMainNet() ? 27 : srs.length;
    await Promise.all(
      srs.map(async sr => {
        let witness = new Witness();
        const account = await this.getAccount(sr.address);
        witness.address = sr.address;
        witness.votes = this._filterData(sr.voteCount);
        witness.votesPercentage = (100 * (witness.votes / totalVotes)).toFixed(
          6
        );
        witness.url = sr.url;
        witness.voteReward = Math.ceil(
          totalVoteReward * (witness.votes / totalVotes)
        );
        witness.blockReward = Math.ceil(totalBlockReward / srAmount);
        witness.totalReward = witness.voteReward + witness.blockReward;
        witness.totalProduced = sr.totalProduced;
        witness.totalMissed = sr.totalMissed;
        if (account !== null && account !== undefined
            && account.account_name != null && account.account_name !== undefined) {
          witness.name = Util.byteToString(Util.hexstring2btye(account.account_name));
        } else {
          witness.name = sr.url;
        }
        data.push(witness);
      })
    );
    data = _.sortBy(data, d => {
      return d.votes * -1;
    });

    data.map((sr, index) => {
      sr.rank = index + 1;
      if (index < 27) {
        srData.push(sr);
      } else {
        sr.blockReward = 0;
        sr.totalReward = sr.voteReward;
        candidateData.push(sr);
      }
      return 0;
    });

    let top10SrTmp = JSON.parse(JSON.stringify(data));
    top10SrTmp = _.sortBy(top10SrTmp, d => {
      return d.totalProduced * -1;
    });
    top10SrTmp.map((sr, index) => {
      sr.rank = index + 1;
      if (index < 10) {
        top10Sr.push(sr);
      }
      return 0;
    });

    return {
      srData: srData,
      candidateData: candidateData,
      allData: data,
      top10Sr: top10Sr,
      totalVotes: totalVotes
    };
  }

  async getPriceHistory(resourceType, dateType) {
    let net = netRouter.isMainNet() ? 0 : 1
    let data = await httpProvider.post(dataProcessUrl + "/getweighthis", {net: net, type: resourceType, dateType: dateType});
    data = JSON.parse(data)
    if (data.length > 0) {
      let filteredData = [];
      for (let i in data) {      
        filteredData.push({
          date: Util.formatDateTime(data[i].create_date),
          price: parseFloat((10e5 * data[i].total_weight / data[i].total_limit).toFixed(2))// in sun
        });
      }
      let sortedData = _.sortBy(filteredData, d => {
        return d.price;
      });
      let min = sortedData[0].price;
      let max = sortedData[sortedData.length - 1].price;
      let diff = parseFloat((max - min).toFixed(2));
      min = Math.floor(min - (diff * 0.4))
      max = Math.ceil(max + (diff * 0.3))
      return {min: min, max: max, data: filteredData, interval: Math.round(filteredData.length / 3)};
    }
    return {min: 0, max: 0, data: [], interval: 0}
  }

  async getRewardHistory(address, dateType) {
    let net = netRouter.isMainNet() ? 0 : 1
    let data = await httpProvider.post(dataProcessUrl + "/getrewardhis", {net: net, address: address, dateType: dateType});
    data = JSON.parse(data)
    if (data.length > 0) {
      let filteredData = [];
      for (let i in data) {
        filteredData.push({
          date: Util.formatDateTime(data[i].create_date),
          totalreward: parseInt(data[i].sr_total_reward, 10)
        });
      }
      let sortedData = _.sortBy(filteredData, d => {
        return d.totalreward;
      });
      let min = sortedData[0].totalreward;
      let max = sortedData[sortedData.length - 1].totalreward;
      let diff = max - min;
      if (diff > 0) {
        min = Math.floor(min - (diff * 0.4))
        max = Math.ceil(max + (diff * 0.4))
      } else {
        min = Math.floor(min - min * 0.4)
        max = Math.ceil(max + max * 0.4)
      }
      return {min: min, max: max, data: filteredData, interval: filteredData.length <= 3 ? 0 : Math.round(filteredData.length / 3)};
    } else {
      return {min: 0, max: 0, data: [], interval: 0};
    }
  }

  async getCurrentCurrency() {
    try {
      let data = await httpProvider.post(dataProcessUrl + "/getusdcurrency", {symbol: 'TRX', basedSymbol: 'USD'});
      data = JSON.parse(data);
      return {symbol: 'TRX', currency: data.price};
    } catch(e) {
      console.log(e);
      return {symbol: 'TRX', currency: 0};
    }
  }
}

export default Api;
