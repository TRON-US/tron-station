import React from 'react'
import { Table, Input, Form, Select, Radio } from 'antd'
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

// services
import Api from 'services/api.js'
import EventEmitter from 'services/eventEmitter.js'
import Util from 'utils/utils.js'
import * as Constant from 'utils/constant.js'

// styles
import './style.scss'

const FormItem = Form.Item;
const Option = Select.Option;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

class DashboardForm extends React.Component {
  constructor(props) {
    super(props);
    this.api = new Api();
    this.state = {
      // ENERGY CHART STATE
      freezeEnergyDateType: '1d',
      freezeEnergyHisData: [],
      freezeEnergyHisMin: 0,
      freezeEnergyHisMax: 0,
      freezeEnergyHisInterval: 0,

      // BP CHART STATE
      freezeBpDateType: '1d',
      freezeBpHisData: [],
      freezeBpHisMin: 0,
      freezeBpHisMax: 0,
      freezeBpHisInterval: 0,

      // REAL TIME STATE
      freezeEnergyPrice: 0,
      freezeBpPrice: 0,
      totalVotes: 0,

      // TOP MINER STATE
      top10SrData: [],
      querySrData: [],
      srSelect: {},

      // SR CHART STATE
      voteRewardDateType: '1d',
      voteRewardHisData: [],
      voteRewardHisMin: 0,
      voteRewardHisMax: 0,
      voteRewardHisInterval: 0,

      // UNIT CONVERTER STATE
      trxUsdPrice: 0,
      unit1: 'trx',
      unit2: 'sun',
      amount1: 1,
      amount2: 10e5
    };
  }

  componentDidMount() {
    let self = this;
    // INIT DATA
    this.init();
    EventEmitter.subscribe('changeNet', function() {
      self.api = new Api()
      self.init()
    });
  }

  componentWillUnmount() {
    EventEmitter.unSubscribe('changeNet');
  }

  async init() {
    this.refreshEnergyChart(this.state.freezeEnergyDateType);
    this.refreshBpChart(this.state.freezeBpDateType);
    this.refreshSrTable();
    let frozenEnergyData = await this.api.getFrozenEnergy(1);
    let frozenBpData = await this.api.getFrozenBandwidth(1);
    let currencyData = await this.api.getCurrentCurrency();

    this.setState({
      freezeEnergyPrice: frozenEnergyData.energyPrice,
      freezeBpPrice: frozenBpData.bpPrice,
      trxUsdPrice: parseFloat(currencyData.currency),
      trxUSdPriceDate: Util.formatDateTime(currencyData.create_date)
    });
  }

  async refreshEnergyChart(dateType) {
    let energyData = await this.api.getPriceHistory(0, dateType);
    this.setState({
      freezeEnergyHisData: energyData.data, 
      freezeEnergyHisMin: energyData.min,
      freezeEnergyHisMax: energyData.max,
      freezeEnergyHisInterval: energyData.interval
    });
  }

  async refreshBpChart(dateType) {
    let bpData = await this.api.getPriceHistory(1, dateType);
    this.setState({
      freezeBpHisData: bpData.data, 
      freezeBpHisMin: bpData.min,
      freezeBpHisMax: bpData.max,
      freezeBpHisInterval: bpData.interval,
    });
  }

  async refreshSrTable(dateType) {
    let rewardData = await this.api.getSuperRepresentatives();
    this.setState({
      totalVotes: rewardData.totalVotes,
      top10SrData: rewardData.top10Sr,
      querySrData: rewardData.allData
    });
    if (rewardData.allData.length) {
      this.setState({srSelect: rewardData.allData[0]});
      this.refreshVoteRewardChart(rewardData.allData[0].address, this.state.voteRewardDateType);
    }
  }

  async refreshVoteRewardChart(address, dateType) {
    let rewardData = await this.api.getRewardHistory(address, dateType);
    this.setState({
      voteRewardHisData: rewardData.data, 
      voteRewardHisMin: rewardData.min,
      voteRewardHisMax: rewardData.max,
      voteRewardHisInterval: rewardData.interval
    });
  }

  handleInputChange(value, name) {
    if (name === 'changeUnit1') {
      this.setState({unit1: value});
      this.calcUnit(1, value, this.state.unit2, this.state.amount1);
    } else if (name === 'changeUnit2') {
      this.setState({unit2: value});
      this.calcUnit(2, value, this.state.unit1, this.state.amount2);
    } else if (name === 'calUnitFromFirst') {
      this.calcUnit(1, this.state.unit1, this.state.unit2, value);      
    } else if (name === 'calUnitFromSecond') {
      this.calcUnit(2, this.state.unit2, this.state.unit1, value);
    } else if (name === 'freezeEnergyDate') {
      this.setState({ freezeEnergyDateType: value });
      this.refreshEnergyChart(value);
    } else if (name === 'freezeBpDate') {
      this.setState({ freezeBpDateType: value });
      this.refreshBpChart(value);
    } else if (name === 'voteRewardDate') {
      this.setState({ voteRewardDateType: value });
      this.refreshVoteRewardChart(this.state.srSelect.address, value);
    } else if (name === 'srSelect') {
      this.setState({ srSelect: this.state.querySrData[value] });
      this.refreshVoteRewardChart(this.state.querySrData[value].address, this.state.voteRewardDateType);
    }
  }
  
  calcUnit(fromInput, fromType, toType, value) {
    let res = '';
    if (value === '' || fromType=== toType) {
      res = value
    } else if (fromType === 'trx' && toType === 'sun') {
      let sun = parseFloat(parseFloat(value) * 1000000);
      res = Number(sun)
      .toFixed(20)
      .replace(/\.?0+$/, "");
    } else if (fromType === 'sun' && toType === 'trx') {
      res = parseFloat(parseFloat(value) / 1000000);
    } else if (fromType === 'trx' && toType === 'usd') {
      res = parseFloat(parseFloat(value) * parseFloat(this.state.trxUsdPrice)).toFixed(5);
    } else if (fromType === 'usd' && toType === 'trx') {
      res = parseFloat(parseFloat(value) / parseFloat(this.state.trxUsdPrice)).toFixed(5);
    } else if (fromType === 'sun' && toType === 'usd') {
      let usd = parseFloat((parseFloat(value) / 10e5) * parseFloat(this.state.trxUsdPrice));
      res = Number(usd)
      .toFixed(20)
      .replace(/\.?0+$/, "");
    } else if (fromType === 'usd' && toType === 'sun') {
      res = parseFloat((parseFloat(value) * 10e5) / parseFloat(this.state.trxUsdPrice)).toFixed(5);
    }
    if (fromInput === 1) {
      this.setState({ amount1: value, amount2: res });
    } else {
      this.setState({ amount2: value, amount1: res });
    }
  }

  tooltipContent (tooltipProps) {
    if (tooltipProps.payload && tooltipProps.payload.length > 0) {
      return (
        <div className="recharts-tooltip">
          <div style={{opacity: '1'}}>Date: { tooltipProps.payload[0].payload.date}</div>
          <div style={{opacity: '1', fontSize: '13px'}}><strong>Price: {tooltipProps.payload[0].payload.price} Sun</strong></div>
        </div>
      );
    }
  }

  tooltipRewardContent (tooltipProps) {
    if (tooltipProps.payload && tooltipProps.payload.length > 0) {
      return (
        <div className="recharts-tooltip">
          <div style={{opacity: '1'}}>Date: { tooltipProps.payload[0].payload.date}</div>
          <div style={{opacity: '1', fontSize: '13px'}}><strong>Total Votes Reward: {tooltipProps.payload[0].payload.totalreward.toLocaleString()} Trx</strong></div>
        </div>
      );
    }
  }

  render() {
    const unit1After = (
      <Select
        defaultValue={this.state.unit1}
        onChange={value => this.handleInputChange(value, "changeUnit1")}
        style={{ fontWeight: '600' }}
      >
        <Option value={'trx'}>TRX</Option>
        <Option value={'sun'}>SUN</Option>
        <Option value={'usd'}>USD</Option>
      </Select>
    );
    const unit2After = (
      <Select
        defaultValue={this.state.unit2}
        onChange={value => this.handleInputChange(value, "changeUnit2")}
        style={{ fontWeight: '600' }}
      >
        <Option value={'trx'}>TRX</Option>
        <Option value={'sun'}>SUN</Option>
        <Option value={'usd'}>USD</Option>
      </Select>
    );
    const rewardTableColumns = [
      {
        title: <strong>Rank</strong>,
        dataIndex: 'rank',
        render: text => <a href onClick={(e) => {e.preventDefault();}}>{text}</a>,
      },
      {
        title: <strong>Name</strong>,
        dataIndex: 'name',
        render: (text, record) => <a style={{color:'#db3747'}} href={record.url}
        target="_blank"
        rel="noopener noreferrer">{text}</a>
      },
      {
        title: <strong>Produced Blocks</strong>,
        dataIndex: 'totalProduced',
        render: text => <a href onClick={(e) => {e.preventDefault();}}>{text}</a>,
      },
      {
        title: <strong>Missed Blocks</strong>,
        dataIndex: 'totalMissed',
        render: text => <a href onClick={(e) => {e.preventDefault();}}>{text}</a>,
      },
    ];

    return (
      <div>
        <div className="row">
          <div className="col-lg-12 col-xl-6">
            <div className="card">
              <div className="card-header">
                <div className="utils__title">
                  <strong>{Constant.DASHBOARD_ENERGYHIS_TITLE}</strong>
                </div>
              </div>
              <div className="card-body">
                <div className="card-body-mb10">
                  <RadioGroup  
                      defaultValue={this.state.freezeEnergyDateType} 
                      size="small"
                      onChange={event => this.handleInputChange(event.target.value, 'freezeEnergyDate')}>
                    <RadioButton value={'12h'}>12h</RadioButton>
                    <RadioButton value={'1d'}>1d</RadioButton>
                    <RadioButton value={'1w'}>1w</RadioButton>
                    <RadioButton value={'1m'}>1m</RadioButton>
                  </RadioGroup>
                </div>
                <ResponsiveContainer width='100%' aspect={4.0/1.2}>
                  <AreaChart data={this.state.freezeEnergyHisData} margin={{top: 20, right: 30, left: 0, bottom: 0}}>
                    <defs>
                      <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#cf132d" stopOpacity={0.7}/>
                        <stop offset="95%" stopColor="#cf132d" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3"/>
                    <XAxis dataKey="date" interval={this.state.freezeEnergyHisInterval}/>
                    <YAxis domain={[this.state.freezeEnergyHisMin, this.state.freezeEnergyHisMax]}/>
                    <Tooltip content={ this.tooltipContent } />
                  <Area type='monotone' dataKey='price' stroke='#cf132d' strokeWidth={3} fillOpacity={1} fill="url(#colorUv)" />
                </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card">
              <div className="card-header">
                <div className="utils__title">
                  <strong>{Constant.DASHBOARD_BPHIS_TITLE}</strong>
                </div>
              </div>
              <div className="card-body">
                <div className="card-body-mb10">
                  <RadioGroup  
                    defaultValue={this.state.freezeBpDateType} 
                    size="small"
                    onChange={event => this.handleInputChange(event.target.value, 'freezeBpDate')}>
                    <RadioButton value={'12h'}>12h</RadioButton>
                    <RadioButton value={'1d'}>1d</RadioButton>
                    <RadioButton value={'1w'}>1w</RadioButton>
                    <RadioButton value={'1m'}>1m</RadioButton>
                  </RadioGroup>
                </div>
                <ResponsiveContainer width='100%' aspect={4.0/1.2}>
                  <AreaChart data={this.state.freezeBpHisData} margin={{top: 20, right: 30, left: 0, bottom: 0}}>
                    <defs>
                      <linearGradient id="colorBp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.7}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3"/>
                    <XAxis dataKey="date" interval={this.state.freezeBpHisInterval}/>
                    <YAxis domain={[this.state.freezeBpHisMin, this.state.freezeBpHisMax]}/>
                    <Tooltip content={ this.tooltipContent } />
                  <Area type='monotone' dataKey='price' stroke='#8884d8' strokeWidth={3} fillOpacity={1} fill="url(#colorBp)" />
                </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card">
              <div className="card-header">
                <div className="utils__title">
                  <strong>{Constant.DASHBOARD_SRHIS_TITLE}</strong>
                </div>
              </div>
              <div className="card-body">
                <Form layout="inline">
                    <FormItem label={<strong>Date Range</strong>} style={{marginRight: '80px'}}>
                    <RadioGroup  
                        defaultValue={this.state.voteRewardDateType} 
                        size="small"
                        onChange={event => this.handleInputChange(event.target.value, 'voteRewardDate')}>
                      <RadioButton value={'1d'}>1d</RadioButton>
                      <RadioButton value={'1w'}>1w</RadioButton>
                      <RadioButton value={'1m'}>1m</RadioButton>
                      <RadioButton value={'6m'}>6m</RadioButton>
                    </RadioGroup>
                  </FormItem>
                  <FormItem label={<strong>SR</strong>} >
                    <Select
                      showSearch
                      style={{ width: '200px' }}
                      defaultValue={0}
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {this.state.querySrData.map((row, index) => {
                        return (
                          <Option
                            key={index}
                            value={index}
                            onClick={event =>
                              this.handleInputChange(index, "srSelect")
                            }
                          >
                            {row.name.toString()}
                          </Option>
                        );
                      })}
                    </Select>
                  </FormItem>
                </Form>
                <ResponsiveContainer width='100%' aspect={4.0/1.3}>
                  <AreaChart data={this.state.voteRewardHisData} margin={{top: 20, right: 30, left: 0, bottom: 0}}>
                    <defs>
                      <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#40a9ff" stopOpacity={0.7}/>
                        <stop offset="95%" stopColor="#40a9ff" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3"/>
                    <XAxis dataKey="date" interval={this.state.voteRewardHisInterval}/>
                    <YAxis domain={[this.state.voteRewardHisMin, this.state.voteRewardHisMax]}/>
                    <Tooltip content={ this.tooltipRewardContent } />
                    <Area type='monotone' dataKey='totalreward' stroke='#40a9ff' strokeWidth={3} fillOpacity={1} fill="url(#colorBlue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>        
          </div>          
          <div className="col-lg-12 col-xl-6">
            <div className="card">
              <div className="card-header">
                <div className="utils__title">
                  <strong>{Constant.DASHBOARD_RTINFO_TITLE}</strong>
                </div>
                <div className="utils__titleDescription">
                  {Constant.DASHBOARD_RTINFO_SUBTITLE}
                </div>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-lg-4">
                    <div className="infoCard infoCard--primary">
                      <div className="row">
                        <div className="col-lg-4">
                          <span className="infoCard__digit">
                            <i className="icmn-power" />
                          </span>
                        </div>
                        <div className="col-lg-8">
                          <div className="infoCard__desc">
                            <span className="infoCard__title">{this.state.freezeEnergyPrice} SUN</span>
                            <p>Freeze Energy Price</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <div className="infoCard infoCard--green">
                      <div className="row">
                        <div className="col-lg-4">
                          <span className="infoCard__digit">
                            <i className="icmn-podcast" />
                          </span>
                        </div>
                        <div className="col-lg-8">
                          <div className="infoCard__desc">
                            <span className="infoCard__title">{this.state.freezeBpPrice} SUN</span>
                            <p>Freeze BP Price</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <div className="infoCard infoCard--blue">
                      <div className="row">
                        <div className="col-lg-4">
                          <span className="infoCard__digit">
                            <i className="icmn-stopwatch" />
                          </span>
                        </div>
                        <div className="col-lg-8">
                          <div className="infoCard__desc">
                            <span className="infoCard__title">3 Seconds</span>
                            <p>Wait Time / Block</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <div className="infoCard infoCard--empty">
                      <div className="row">
                        <div className="col-lg-4">
                          <span className="infoCard__digit">
                            <i className="icmn-price-tag" />
                          </span>
                        </div>
                        <div className="col-lg-8">
                          <div className="infoCard__desc">
                            <span className="infoCard__title">10 SUN</span>
                            <p>Burn Energy Price</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <div className="infoCard infoCard--empty">
                      <div className="row">
                        <div className="col-lg-4">
                          <span className="infoCard__digit">
                            <i className="icmn-equalizer" />
                          </span>
                        </div>
                        <div className="col-lg-8">
                          <div className="infoCard__desc">
                            <span className="infoCard__title">10 SUN</span>
                            <p>Tx Bytes Price</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <div className="infoCard infoCard--empty">
                      <div className="row">
                        <div className="col-lg-4">
                          <span className="infoCard__digit">
                            <i className="icmn-users" />
                          </span>
                        </div>
                        <div className="col-lg-8">
                          <div className="infoCard__desc">
                            <span className="infoCard__title">{this.state.totalVotes.toLocaleString()}</span>
                            <p>Total Votes</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-header">
                <div className="utils__title">
                  <strong>{Constant.DASHBOARD_UNITCONV_TITLE}</strong>
                </div>
                <div className="utils__titleDescription">
                  <span style={{color: 'grey'}}>
                    1 TRX = 1,000,000 SUN = {this.state.trxUsdPrice} USD &nbsp;&nbsp;
                    <font style={{fontSize: '11px'}}>{this.state.trxUSdPriceDate}</font>
                  </span>
                </div>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-lg-8">
                    <div className="row">
                      <div className="col-lg-6">
                       <Input
                          type="text"
                          value={this.state.amount1}
                          onChange={event => this.handleInputChange(event.target.value, 'calUnitFromFirst')}
                          style={{ width: '100%', marginRight: '3%'}}
                          addonAfter={unit1After} 
                        />
                      </div>
                      <div className="col-lg-6">
                       <Input
                          type="text"
                          value={this.state.amount2}
                          onChange={event => this.handleInputChange(event.target.value, 'calUnitFromSecond')}
                          style={{ width: '100%', marginRight: '3%' }}
                          addonAfter={unit2After} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-header">
                <div className="utils__title">
                  <strong>{Constant.DASHBOARD_TOP10SR_TITLE}</strong>
                </div>
                <div className="utils__titleDescription">
                </div>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-lg-12">
                    <Table
                      columns={rewardTableColumns}
                      dataSource={this.state.top10SrData}
                      pagination={false}
                      rowKey="name"
                    />
                  </div>
                </div>
              </div>
            </div>         
          </div>
        </div>
      </div>
    )
  }
}

export default DashboardForm
