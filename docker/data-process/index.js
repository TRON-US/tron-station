const httpProvider = require('./httpProvider');
const util = require('./utils');
const express = require('express')
const cors = require('cors')
const mysql = require('mysql')
const schedule = require('node-schedule');
const _ = require('lodash');
const app = express()
const bodyParser = require('body-parser');

// net conf
const mainNet = {
  url: "https://api.trongrid.io",
  defaultAddress: "4142232FF1BDDD5F01C948C9A661E43308648CFEB2"
}
const shastaNet = {
  url: "https://api.shasta.trongrid.io",
  defaultAddress: "41928C9AF0651632157EF27A2CF17CA72C575A4D21"
}

// port
const port = 8080;

// test timer conf
// const weightTimer = '0 * * * * *';
// const voteRewardRule = '30 * * * * *';
// production timer conf
const weightTimer = '5 */1 * * *';
const voteRewardRule = new schedule.RecurrenceRule();
const voteRewardTimer = [4, 10, 16, 22];
voteRewardRule.hour  = voteRewardTimer; 
voteRewardRule.minute = 5;

// sqls
const SELECT_WEIGHT_HIS = 'select id, total_limit, total_weight, create_date, type, net from t_weight_his ' + 
                          'where net = ? and type = ? and create_date >= ? and create_date <= ?'
const SELECT_VOTE_REWARD_HIS = 'select id, sr_name, sr_address, sr_votes, sr_votes_reward, sr_block_reward, ' +  
                          'sr_total_reward, create_date, net from t_reward_his ' + 
                          'where net = ? and sr_address = ? and create_date >= ? and create_date <= ?'

const INSERT_WEIGHT_HIS = 'insert into t_weight_his(total_limit, total_weight, create_date, type, net) values ?'
const INSERT_VOTE_REWARD_HIS = 'insert into t_reward_his(sr_name, sr_address, sr_votes, ' +
                               'sr_votes_reward, sr_block_reward, sr_total_reward, create_date, net) values ?'

const cmcKey = 'your cmc key'
const cmcUrl = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=TRX'

// init db
const pool = mysql.createPool({
  host: 'localhost',
  port: '3306',
  database: 'tronstation',
  user: 'root',
  password: 'noPass123',
  dateStrings: true
})

pool.getConnection(err => {
  if(err) {
    return err;
  }
})

// Api Router
app.use(cors())
app.use(bodyParser.json({limit: '1mb'})); 
app.use(bodyParser.urlencoded({extended: true}))

app.get('/api', (req, res) =>{
  res.send('This is tronstation db data api')
})

app.post('/api/getusdcurrency', async (req, res) =>{
  let header = {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/plain',
    'X-CMC_PRO_API_KEY': cmcKey
  }
  let data = await httpProvider.get(cmcUrl, header);
  data = JSON.parse(data);
  data = data.data;
  if (data === undefined) {
    return res.json({name: 'TRX', price: 0});
  } else {
    return res.json({name: 'TRX', price: data.TRX.quote.USD.price.toFixed(5)});
  }
})

app.post('/api/getweighthis', async (req, res) => {
  let net = req.body.net
  let type = req.body.type
  let params = [net, type]

  switch(req.body.dateType) {
    case '12h':
      params.push(new Date(new Date().getTime() - 12 * 60 * 60 * 1000));
      params.push(new Date());
      break;
    case '1d':
      params.push(new Date(new Date().getTime() - 24 * 60 * 60 * 1000));
      params.push(new Date());
      break;
    case '1w':
      params.push(new Date(new Date().getTime() - 24 * 7 * 60 * 60 * 1000));
      params.push(new Date());
      break;
    case '1m':
      params.push(new Date(new Date().getTime() - 24 * 30 * 60 * 60 * 1000));
      params.push(new Date());
      break;
    default:
      params.push(new Date(new Date().getTime() - 12 * 60 * 60 * 1000));
      params.push(new Date());
      break;
  }
  let data = await query(SELECT_WEIGHT_HIS, params)
  return res.json(data);
})


app.post('/api/getrewardhis', async (req, res) => {
  let net = req.body.net
  let address = req.body.address
  let params = [net, address]

  switch(req.body.dateType) {
    case '1d':
      params.push(new Date(new Date().getTime() - 24 * 60 * 60 * 1000));
      params.push(new Date());
      break;
    case '1w':
      params.push(new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000));
      params.push(new Date());
      break;
    case '1m':
      params.push(new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000));
      params.push(new Date());
      break;
    case '6m':
      params.push(new Date(new Date().getTime() - 6 * 30 * 24 * 60 * 60 * 1000));
      params.push(new Date());
      break;
    default:
      params.push(new Date(new Date().getTime() - 24 * 60 * 60 * 1000));
      params.push(new Date());
      break;
  }
  let data = await query(SELECT_VOTE_REWARD_HIS, params)
  return res.json(data);
})


// Weight Scheduler
function scheduleWeightHistory(){
  // insert per hour
  schedule.scheduleJob(weightTimer, async function(){

    // Main net
    let res = await httpProvider.post(mainNet.url + "/wallet/getaccountresource", 
                JSON.stringify({'address': mainNet.defaultAddress}));
    console.log('schedule weight history(main net)' + new Date() + ': ' + res);
    res = JSON.parse(res);
    let sqlParam = [
      [res.TotalEnergyLimit, res.TotalEnergyWeight, new Date(), 0, 0],
      [res.TotalNetLimit, res.TotalNetWeight, new Date(), 1, 0]
    ];
    pool.query(INSERT_WEIGHT_HIS, [sqlParam], (err, result) => {
      if(err) {
        console.log(err);
      } 
    })

    // Test net
    res = await httpProvider.post(shastaNet.url + "/wallet/getaccountresource", 
            JSON.stringify({'address': shastaNet.defaultAddress}));
    console.log('schedule weight history(test net)' + new Date() + ': ' + res);
    res = JSON.parse(res);
    sqlParam = [
      [res.TotalEnergyLimit, res.TotalEnergyWeight, new Date(), 0, 1],
      [res.TotalNetLimit, res.TotalNetWeight, new Date(), 1, 1]
    ];
    pool.query(INSERT_WEIGHT_HIS, [sqlParam], (err, result) => {
      if(err) {
        console.log(err);
      } 
    })
  }); 
}

// Vote Reward Scheduler
function scheduleVoteRewardHistory(){
  // insert 4, 10, 16, 22
  schedule.scheduleJob(voteRewardRule, async function(){

    let totalVoteReward = 16 * 20 * 60 * 24;
    let totalBlockReward = 2 * totalVoteReward;

    // Main net
    let res = await httpProvider.post(mainNet.url + "/wallet/listwitnesses");
    // console.log('schedule vote reward history(main net)' + new Date() + ': ' + res);
    res = JSON.parse(res);
    let witnesses = res.witnesses;
    let sqlParam = [];
    let totalVotes = _.sumBy(witnesses, witness => { return witness.voteCount; })
    let srAmount = 27;

    witnesses = _.sortBy(witnesses, d => { return d.voteCount * -1; });

    for (let index = 0; index < witnesses.length; index++) {
      let witness = witnesses[index];
      let account = await httpProvider.post(mainNet.url + "/wallet/getaccount",
                      JSON.stringify({'address': witness.address}));
      account = JSON.parse(account);
      let voteReward = Math.ceil(totalVoteReward * ((witness.voteCount === undefined ? 0 : witness.voteCount) / totalVotes));
      let blockReward = index < 27 ? Math.ceil(totalBlockReward / srAmount) : 0
      sqlParam.push([
        account.account_name === undefined ? witness.url : util.byteToString(util.hexstring2btye(account.account_name)),
        witness.address,
        witness.voteCount === undefined ? 0 : witness.voteCount,
        voteReward,
        blockReward,
        voteReward + blockReward,
        new Date(),
        '0'
      ])
    }
    pool.query(INSERT_VOTE_REWARD_HIS, [sqlParam], (err, result) => {
      if(err) {
        console.log(err);
      } 
    })

    // Test net
    res = await httpProvider.post(shastaNet.url + "/wallet/listwitnesses");
    // console.log('schedule vote reward history(test net)' + new Date() + ': ' + res);
    res = JSON.parse(res);
    witnesses = res.witnesses;
    sqlParam = [];
    totalVotes = _.sumBy(witnesses, witness => { return witness.voteCount; })
    srAmount = witnesses.length;

    witnesses = _.sortBy(witnesses, d => { return d.voteCount * -1; });

    for (let index = 0; index < witnesses.length; index++) {
      let witness = witnesses[index];
      let account = await httpProvider.post(mainNet.url + "/wallet/getaccount",
                      JSON.stringify({'address': witness.address}));
      account = JSON.parse(account);
      let voteReward = Math.ceil(totalVoteReward * ((witness.voteCount === undefined ? 0 : witness.voteCount) / totalVotes));
      let blockReward = index < 27 ? Math.ceil(totalBlockReward / srAmount) : 0
      sqlParam.push([
        account.account_name === undefined ? witness.url : util.byteToString(util.hexstring2btye(account.account_name)),
        witness.address,
        witness.voteCount === undefined ? 0 : witness.voteCount,
        voteReward,
        blockReward,
        voteReward + blockReward,
        new Date(),
        '1'
      ])
    }
    pool.query(INSERT_VOTE_REWARD_HIS, [sqlParam], (err, result) => {
      if(err) {
        console.log(err);
      } 
    })
  }); 
}

// Query util
function query(sql, params) {
  return new Promise(( resolve, reject ) => {
    pool.getConnection(function(err, connection) {
      if (err) {
        reject(err)
      } else {
        connection.query(sql, params, (err, rows) => {
          if (err) {
            reject(err)
          } else {
            resolve(rows)
          }
          connection.release()
        })
      }
    })
  })
}

app.listen(port, () => {
  console.log('start tronstation data process on ' + port)
  scheduleWeightHistory();
  scheduleVoteRewardHistory();
})