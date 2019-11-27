import React from 'react'
import { Collapse, Input, Select, Button } from 'antd'

// services
import Api from 'services/api.js';
import EventEmitter from 'services/eventEmitter.js';
import * as Constant from 'utils/constant.js'

// styles
import './style.scss'

const Option = Select.Option;
const Panel = Collapse.Panel;

class EnergyCalcForm extends React.Component {
  constructor(props) {
    super(props);
    this.api = new Api();
    this.state = {
      // FROZEN ENERGY STATE
      frozenEnergyRatio: 0,
      frozenEnergyUnit: 1,
      frozenEnergyTrx: 1,
      frozenEnergy: 0,
      frozenBpRatio: 0,
      frozenBpUnit: 1,
      frozenBpTrx: 1,

      // FROZEN BP STATE
      frozenBp: 0,
      burnedEnergyRatio: 0, 
      burnedEnergyUnit: 1,
      burnedEnergyTrx: 1,
      burnedEnergy: 0,
      burnedEnergyFee: 0,

      // MAX ENERGY LIMIT STATE
      hexAddress: '',
      feeLimit: '',
      feeLimitState: '',
      feeLimitUnit: 1,
      maxEnergy: {},
      TotalEnergyWeight: '',
      maxEnergyMsg: '',

      // TX STATE
      txBandwidth: '',
      txByteSize: '',

      // ACCOUNT STATE
      hexAddressBp: '',
      maxBandwidth: {},
      maxBpMsg: ''
    };
  }

  componentDidMount() {
    let self = this;
    this.init();
    EventEmitter.subscribe('changeNet', function() {
      self.api = new Api();
      self.init();
    });
  }

  componentWillUnmount() {
    EventEmitter.unSubscribe('changeNet');
  }

  async init() {
    let frozenEnergyData = await this.api.getFrozenEnergy(this.state.frozenEnergyTrx * this.state.frozenEnergyUnit);
    this.setState({ 
      frozenEnergyRatio: parseFloat(frozenEnergyData.energy.toFixed(5)), 
      frozenEnergy: parseFloat(frozenEnergyData.energy.toFixed(5)) 
    });

    let burnedEnergyData = await this.api.getBurnEnergy(this.state.burnedEnergyTrx * this.state.burnedEnergyUnit);
    this.setState({ 
      burnedEnergyRatio: parseFloat(burnedEnergyData.energy.toFixed(5)), 
      burnedEnergy: parseFloat(burnedEnergyData.energy.toFixed(5)), 
      burnedEnergyFee: burnedEnergyData.energyFee 
    });

    let frozenBpData = await this.api.getFrozenBandwidth(this.state.frozenBpTrx * this.state.frozenBpUnit);
    this.setState({ 
      frozenBpRatio: parseFloat(frozenBpData.bp.toFixed(5)), 
      frozenBp: parseFloat(frozenBpData.bp.toFixed(5)) 
    });

    this.setState({ 
      maxEnergy: {}, 
      maxBandwidth: {}
    });
  }

  handleInputChange(value, name) {
    switch (name) {
      case 'calcFrozenEnergy':
        if (value.trim() === '') {
          this.setState({
            frozenEnergyTrx: '', 
            frozenEnergy: '' 
          });
        } else {
          this.setState({
            frozenEnergyTrx: value, 
            frozenEnergy: parseFloat((value * this.state.frozenEnergyUnit * this.state.frozenEnergyRatio).toFixed(5))
          });
        }
        break;
      case 'calcFrozenTrxEnergy':
        if (value.trim() === '') {
          this.setState({
            frozenEnergyTrx: '', 
            frozenEnergy: '' 
          });
        } else {
          this.setState({ 
            frozenEnergy: value, 
            frozenEnergyTrx: parseFloat((value / (this.state.frozenEnergyUnit * this.state.frozenEnergyRatio)).toFixed(5))
          });
        }
        break;
      case 'calcFrozenBp':
        if (value.trim() === '') {
          this.setState({
            frozenBpTrx: '', 
            frozenBp: '' 
          });
        } else {
          this.setState({
            frozenBpTrx: value, 
            frozenBp: parseFloat((value * this.state.frozenBpUnit * this.state.frozenBpRatio).toFixed(5))
          });
        }
        break;
      case 'calcFrozenTrxBp':
        if (value.trim() === '') {
          this.setState({
            frozenBpTrx: '', 
            frozenBp: '' 
          });
        } else {
          this.setState({ 
            frozenBp: value, 
            frozenBpTrx: parseFloat((value / (this.state.frozenBpUnit * this.state.frozenBpRatio)).toFixed(5))
          });
        }
        break;
      case 'calcBurnedEnergy':
        if (value.trim() === '') {
          this.setState({
            burnedEnergyTrx: '', 
            burnedEnergy: '' 
          });
        } else {
          this.setState({
            burnedEnergyTrx: value, 
            burnedEnergy: parseFloat((value * this.state.burnedEnergyUnit * this.state.burnedEnergyRatio).toFixed(5))
          });
        }
        break;
      case 'calcBurnedTrxEnergy':
        if (value.trim() === '') {
          this.setState({
            burnedEnergyTrx: '', 
            burnedEnergy: '' 
          });
        } else {
          this.setState({ 
            burnedEnergy: value, 
            burnedEnergyTrx: parseFloat((value / (this.state.burnedEnergyUnit * this.state.burnedEnergyRatio)).toFixed(5))
          });
        }
        break;
      case 'inputHexAddress':
        this.setState({ hexAddress: value});
        break;
      case 'inputFeeLimit':
        this.setState({ feeLimit: value });
        break;
      case 'inputTxByteSize':
        this.setState({ txByteSize: value, txBandwidth: 10 * value / 10e5});
        break;
      case 'inputHexAddressBp':
        this.setState({ hexAddressBp: value});
        break;
      default:
        break;
    }
  }

  handleSelectChange(value, name) {
    if (name === 'changeFrozenEnergyUnit') {
      this.setState({ 
        frozenEnergyUnit: value,
        frozenEnergy: parseFloat((value * this.state.frozenEnergyTrx * this.state.frozenEnergyRatio).toFixed(5))
      });
    }
    if (name === 'changeBurnedEnergyUnit') {
      this.setState({ 
        burnedEnergyUnit: value,
        burnedEnergy: parseFloat((this.state.burnedEnergyTrx * value * this.state.burnedEnergyRatio).toFixed(5))
      });
    }
    if (name === 'changeFeeLimitUnit') {
      this.setState({feeLimitUnit: value});
    }
    if (name === 'changeFrozenBpUnit') {
      this.setState({ 
        frozenBpUnit: value,
        frozenBp: parseFloat((value * this.state.frozenBpTrx * this.state.frozenBpRatio).toFixed(5))
      });
    }
  }
  
  async calcMaxEnergyLimit() {
    if (this.state.feeLimit === '') {
      this.setState({ maxEnergyMsg: 'Please input fee limit'});
      return;
    }
    if (isNaN(this.state.feeLimit)) {
      this.setState({ maxEnergyMsg: 'Fee limit should be a number'});
      return;
    }
    if (parseInt(this.state.feeLimit, 10) > 1000 || parseInt(this.state.feeLimit, 10) < 0) {
      this.setState({ maxEnergyMsg: 'Fee limit should be between 0 and 1000'});
      return;
    }
    let data = await this.api.getMaxEnergyLimit(
                  this.state.hexAddress,
                  this.state.feeLimit * this.state.feeLimitUnit);
    if (data.status !== 0) {
      this.setState({ maxEnergyMsg: data.msg});
    } else {
      this.setState({ maxEnergyMsg: ''});
      this.setState({ maxEnergy: data });
    }   
  }

  calcTxBandwidth() {
    let sunBurned = 10 * this.state.txByteSize;
    let trxBurned = sunBurned / 10e5;
    this.setState({txBandwidth: trxBurned});
  }

  async calcMaxBandwidthLimit() {
    let data = await this.api.getMaxBandWidthLimit(this.state.hexAddressBp);
    if (data.status !== 0) {
      this.setState({ maxBpMsg: data.msg});
    } else {
      this.setState({ maxBpMsg: ''});
      this.setState({ maxBandwidth: data });
    }  
  }
  
  render() {
    const feeLimitAfter = (
      <Select 
          defaultValue={this.state.feeLimitUnit} 
          onChange={value => this.handleSelectChange(value, 'changeFeeLimitUnit')}
          style={{ width: 80, borderColor: '#1f9dfe', fontWeight: '600'}}>
        <Option value={1}>TRX</Option>
        <Option value={0.000001}>SUN</Option>
      </Select>
    );
    const frozenTrxAfter = (
      <Select
        defaultValue={this.state.frozenEnergyUnit}
        onChange={value => this.handleSelectChange(value, 'changeFrozenEnergyUnit')}
        style={{ fontWeight: '600' }}
      >
        <Option value={1}>TRX</Option>
        <Option value={0.000001}>SUN</Option>
      </Select>
    );
    const frozenEnergyAfter = (
      <Select
        value={"energy"}
        style={{ fontWeight: '600' }}
      >
        <Option value="energy">Energy</Option>
      </Select>
    )
    const burnedTrxAfter = (
      <Select
        defaultValue={this.state.burnedEnergyUnit}
        onChange={value => this.handleSelectChange(value, 'changeBurnedEnergyUnit')}
        style={{ fontWeight: '600' }}

      >
        <Option value={1}>TRX</Option>
        <Option value={0.000001}>SUN</Option>
      </Select>
    )
    const burnedEnergyAfter = (
      <Select
        value={"energy"}
        style={{ fontWeight: '600' }}
      >
        <Option value="energy">Energy</Option>
      </Select>
    )
    const frozenBpAfter = (
      <Select
        defaultValue={this.state.frozenBpUnit}
        onChange={value => this.handleSelectChange(value, 'changeFrozenBpUnit')}
        style={{ fontWeight: '600' }}
      >
        <Option value={1}>TRX</Option>
        <Option value={0.000001}>SUN</Option>
      </Select>
    )
    const frozenBpEnergyAfter = (
      <Select
        value={"energy"}
        style={{ fontWeight: '600' }}
      >
        <Option value="energy">Bandwidth</Option>
      </Select>
    )
    const learnMore = (
      <a className="learn-more" href="javascript:void(0)" rel="noopener noreferrer">Learn more</a>
    );
    const accountRemainPanel = (
      <div className="row">
        <div className="col-lg-6"><strong>Account Remaining Energy:</strong></div>
        <div className="col-lg-6">
          <span style={{ color: '#ea1734'}}>
            {JSON.stringify(this.state.maxEnergy) === "{}"
            ? '----' : this.state.maxEnergy.remainEnergyLimit}
          </span>
        </div>
      </div>
    )
    const feeLimitPanel = (
      <div className="row">
        <div className="col-lg-6"><strong>Fee Limit Energy:</strong></div>
        <div className="col-lg-6">
          <span style={{ color: '#ea1734'}}>{JSON.stringify(this.state.maxEnergy) === "{}"
            ? '----' : this.state.maxEnergy.feeLimitEnergy}
          </span>
        </div>
      </div>
    )
    const maxEnergyPanel = (
      <div className="row">
        <div className="col-lg-6"><strong>Max Energy Limit:</strong></div>
        <div className="col-lg-6">
          <span style={{ color: '#ea1734'}}>{JSON.stringify(this.state.maxEnergy) === "{}"
            ? '----' : this.state.maxEnergy.maxEnergyLimit}
          </span>
        </div>
      </div>
    )
    return (
      <div className="FormDemo">
        <div className="row">
          <div className="col-lg-6">
            <div className="card">
              <div className="card-header">
                <div className="utils__title">
                  <span className={'icmn icmn-power icmn10'}/>
                  <strong>{ Constant.CALC_ENERGY_TITLE }</strong>
                </div>
              </div>
              <div className="card-body">
                <div className="row">
                  {/* frozen energy */}
                  <div className="col-xl-12 col-lg-12">
                    <div className="card card--example">
                      <div className="card-header">
                        <h5 className="text-black">
                          <strong className="text-capitalize">{Constant.CALC_ENERFROZEN_TITLE}</strong>
                        </h5>
                      </div>
                      <div className="card-body pb-0 card-body-pt10">
                        <span className="font-grey-14">1 TRX equals &nbsp;</span>
                        <span className="font-black-30">{this.state.frozenEnergyRatio} energy &nbsp;</span>
                      </div>
                      <div className="card-body pb-0 card-body-pt0">
                        <div id="energy_form">
                          <div className="row">
                            <div className="col-lg-6">
                              <div className="card-body-mt10">
                                <span>
                                  <Input
                                    type="text"
                                    value={this.state.frozenEnergyTrx}
                                    onChange={event => this.handleInputChange(event.target.value, 'calcFrozenEnergy')}
                                    style={{ marginRight: '3%', fontWeight: '800' }}
                                    addonAfter={frozenTrxAfter}
                                  />
                                </span>
                              </div>
                            </div>
                            <div className="col-lg-6">
                              <div className="card-body-mt10">
                                <span>
                                  <Input
                                    type="text"
                                    value={ this.state.frozenEnergy }
                                    onChange={ event => this.handleInputChange(event.target.value, 'calcFrozenTrxEnergy')}
                                    style={{ marginRight: '3%' }}
                                    addonAfter={frozenEnergyAfter}
                                  />
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-lg-12 card-body-mtb5">
                              <Collapse bordered={false}>
                                <Panel header={ learnMore } key="1" showArrow={ false }>
                                  <p className="learn-more-content">
                                    Energy can only be obtained by freezing the TRX. <br/> 
                                    <strong>Energy obtained = TRX frozen for gaining Energy / total TRX frozen for gaining Energy in the entire network * total energy limit. </strong> 
                                    (which is the equally-divided fixed Energy for all users based on the frozen TRX.)
                                  </p>
                                </Panel>
                              </Collapse>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>   
                  {/* burn energy */}
                  <div className="col-xl-12 col-lg-12">
                    <div className="card card--example">
                    <div className="card-header">
                        <h5 className="text-black">
                          <strong className="text-capitalize">{Constant.CALC_ENERBURNED_TITLE}</strong>
                        </h5>
                      </div>
                      <div className="card-body pb-0 card-body-pt10">
                        <span className="font-grey-14">
                          1 TRX equals 
                        </span>
                        <span className="font-black-30">
                          &nbsp;{parseFloat(this.state.burnedEnergyRatio.toFixed(5)).toLocaleString()} energy
                        </span>
                      </div>
                      <div className="card-body pb-0 card-body-pt0">
                        <div id="energy_form">
                          <div className="row">
                            <div className="col-lg-6">
                              <div className="card-body-mt10">
                                <span>
                                  <Input
                                    type="text"
                                    value={this.state.burnedEnergyTrx}
                                    onChange={event => this.handleInputChange(event.target.value, 'calcBurnedEnergy')}
                                    style={{ marginRight: '3%' }}
                                    addonAfter={burnedTrxAfter}
                                  />
                                </span>
                              </div>
                            </div>
                            <div className="col-lg-6">
                              <div className="card-body-mt10">
                                <span>
                                  <Input
                                    type="text"
                                    value={this.state.burnedEnergy}
                                    onChange={event => this.handleInputChange(event.target.value, 'calcBurnedTrxEnergy')}
                                    style={{ marginRight: '3%' }}
                                    addonAfter={burnedEnergyAfter}
                                  />
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-lg-12 card-body-mtb5">
                              <Collapse bordered={false}>
                                <Panel header={ learnMore } key="2" showArrow={ false }>
                                  <p className="learn-more-content">
                                    If account energy is not enough, then deduct all the energy and consume the TRX of the transaction initiator.<br/>
                                    <strong>
                                      The number of TRX = Energy needed * {this.state.burnedEnergyFee} SUN (which is dynamic, and based on 
                                      "modify the fee of 1 energy" proposed parameter value, currently {this.state.burnedEnergyFee} Sun = 1 Energy
                                    </strong>.
                                  </p>
                                </Panel>
                              </Collapse>
                              {/* <span style={{color: 'grey', fontSize: '10px', float: 'right'}}>{Util.getCurrentDateTime()}</span> */}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* max energy limit */}
                  <div className="col-xl-12 col-lg-12">
                    <div className="card card--example">
                      <div className="card-header">
                        <h5 className="text-black">
                          <strong className="text-capitalize">{Constant.CALC_ENERMAXLIMIT_TITLE}</strong>
                        </h5>
                      </div>
                      <div className="card-body pb-0">
                        <div className="row">
                          <div className="col-lg-12 card-body-mb10">
                            <div id="energy_form card-body-mt10">
                              <div className="row">
                                <div className="col-lg-5 card-body-mb10">
                                  <Input
                                    value={this.state.hexAddress}
                                    placeholder={'Hex Address'}
                                    onChange={event => this.handleInputChange(event.target.value, 'inputHexAddress')}
                                    type="text"
                                  />
                                </div>
                                <div className="col-lg-5 card-body-mb15">
                                  <Input
                                      value={this.state.feeLimit}
                                      placeholder={'Fee Limit'}
                                      onChange={event => this.handleInputChange(event.target.value, 'inputFeeLimit')}
                                      type="text"
                                      addonAfter={feeLimitAfter}
                                    />
                                </div>
                                <div className="col-lg-2">
                                  <Button type="primary" onClick={event => this.calcMaxEnergyLimit()}>
                                    Submit
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-lg-5">
                                <span className="error-msg">{ this.state.maxEnergyMsg}</span>
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-12">
                            <Collapse className="card-body-collapse">
                              <Panel 
                                header={<div className="card-body-collapse-header">Estimation</div>} 
                                showArrow={false} 
                                key="0"
                                className="card-body-collapse-panel">
                              </Panel>
                              <Panel header={accountRemainPanel} key="1">
                                <div className="card-body-collapse-panel-header">
                                  <div className="row card-body-collapse-panel-row">
                                    <div className="col-lg-6"><strong>Account energy from freezing TRX:</strong></div>
                                    <div className="col-lg-6">
                                      <span>
                                        { this.state.maxEnergy.energyLimit === undefined ? '-' : this.state.maxEnergy.energyLimit }
                                      </span>
                                    </div>
                                  </div>
                                  <div className="row card-body-collapse-panel-row">
                                    <div className="col-lg-6"><strong>Account energy used:</strong></div>
                                    <div className="col-lg-6">
                                      <span>
                                        { this.state.maxEnergy.energyUsed === undefined ? '-' : this.state.maxEnergy.energyUsed }
                                      </span>
                                    </div>
                                  </div>
                                  <div className="row card-body-collapse-panel-row">
                                    <div className="col-lg-6"><strong>Energy by burning all TRX:</strong></div>
                                    <div className="col-lg-6">
                                      <span>
                                        { this.state.maxEnergy.balanceEnergy === undefined ? '-' : this.state.maxEnergy.balanceEnergy }
                                      </span>
                                    </div>
                                  </div>
                                  <div className="row card-body-collapse-panel-row">
                                    <div className="col-lg-6"><strong>Account remaining energy:</strong></div>
                                    <div className="col-lg-6">
                                      <span>
                                        {JSON.stringify(this.state.maxEnergy) === "{}"
                                        ? '-' : 
                                        this.state.maxEnergy.energyLimit + ' - ' + this.state.maxEnergy.energyUsed + ' + ' + this.state.maxEnergy.balanceEnergy
                                        + '= ' + this.state.maxEnergy.remainEnergyLimit}
                                        </span>
                                    </div>
                                  </div>
                                </div>
                              </Panel>
                              <Panel header={feeLimitPanel} key="2">
                                <div className="card-body-collapse-panel-header">
                                  <div className="row card-body-collapse-panel-row">
                                    <div className="col-lg-6"><strong>Fee limit (in TRX):</strong></div>
                                    <div className="col-lg-6">
                                      <span>
                                        { this.state.maxEnergy.feeLimit === undefined ? '-' : this.state.maxEnergy.feeLimit }
                                      </span>
                                    </div>
                                  </div>
                                  <div className="row card-body-collapse-panel-row">
                                    <div className="col-lg-6"><strong>Energy by freezing 1 TRX:</strong></div>
                                    <div className="col-lg-6">
                                      <span>
                                        { JSON.stringify(this.state.maxEnergy) === "{}" ? '-' : this.state.frozenEnergyRatio }
                                      </span>
                                    </div>
                                  </div>
                                  <div className="row card-body-collapse-panel-row">
                                    <div className="col-lg-6"><strong>Fee limit energy:</strong></div>
                                    <div className="col-lg-6">
                                      <span>
                                      { JSON.stringify(this.state.maxEnergy) === "{}" ? '-' : this.state.maxEnergy.feeLimit 
                                        + ' * ' + this.state.maxEnergy.ratio + ' = ' +
                                        this.state.maxEnergy.feeLimitEnergy}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </Panel>
                              <Panel header={maxEnergyPanel} key="3">
                                <div className="card-body-collapse-panel-header">
                                  <div className="row card-body-collapse-panel-row">
                                    <div className="col-lg-12">
                                      When <strong>Account energy from freezing TRX</strong> is bigger than <strong>Fee limit energy</strong>, 
                                      result is <strong>Minimal(Account energy, Fee limit energy)</strong>,
                                      otherwise choose <strong>Account energy.</strong>
                                    </div>
                                  </div>
                                </div>
                              </Panel>
                            </Collapse>
                          </div>
                        </div>                      
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* bandwidth */}
          <div className="col-lg-6">         
            <div className="card">
              <div className="card-header">
                <div className="utils__title">
                  <span className={'icmn icmn-podcast icmn10'}/>
                  <strong>{Constant.CALC_BP_TITLE}</strong>
                </div>
              </div>
              <div className="card-body">
                <div className="row">
                  {/* frozen bandwidth */}
                  <div className="col-xl-12 col-lg-12">
                    <div className="card card--example">
                      <div className="card-header">
                        <h5 className="text-black">
                          <strong className="text-capitalize">{Constant.CALC_BPFROZEN_TITLE}</strong>
                        </h5>
                      </div>
                      <div className="card-body pb-0 card-body-pt10">
                        <span className="font-grey-14">1 TRX equals &nbsp;</span>
                        <span className="font-black-30">{ this.state.frozenBpRatio } bandwidth &nbsp;</span>
                      </div>
                      <div className="card-body pb-0 card-body-pt0">
                        <div id="bp_form">
                          <div className="row">
                            <div className="col-lg-6">
                              <div className="card-body-mt10">
                                <span>
                                  <Input
                                    type="text"
                                    value={this.state.frozenBpTrx}
                                    onChange={event => this.handleInputChange(event.target.value, 'calcFrozenBp')}
                                    style={{ marginRight: '3%' }}
                                    addonAfter={frozenBpAfter}
                                  />
                                </span>
                              </div>
                            </div>
                            <div className="col-lg-6">
                              <div className="card-body-mt10">
                                <span>
                                  <Input
                                    type="text"
                                    value={ this.state.frozenBp }
                                    onChange={ event => this.handleInputChange(event.target.value, 'calcFrozenTrxBp')}
                                    style={{ marginRight: '3%' }}
                                    addonAfter={frozenBpEnergyAfter}
                                  />
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-lg-12 card-body-mtb5">
                              <Collapse bordered={false}>
                                <Panel header={ learnMore } key="1" showArrow={ false }>
                                  <p className="learn-more-content">
                                    Bandwidth points can be gained in two ways:
                                    Freezing TRX. <strong>The quota = the TRX frozen for gaining bandwidth points / the total TRX frozen in the network for gaining bandwidth points * 43_200_000_000</strong>, 
                                    which is the equally-divided fixed bandwidth points quota for all users based on the frozen TRX.
                                    Or Fixed 5,000 free TRX quota daily for each account.
                                  </p>
                                </Panel>
                              </Collapse>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* tx bandwidth */}
                  <div className="col-xl-12 col-lg-12">
                    <div className="card card--example">
                      <div className="card-header">
                        <h5 className="text-black">
                          <strong className="text-capitalize">{Constant.CALC_BPTX_TITLE}</strong>
                        </h5>
                      </div>
                      <div className="card-body pb-0 card-body-pt30">
                        <div id="energy_form">
                          <div className="row card-body-mb10">
                            <div className="col-lg-5">
                              <strong>Tx Bytes Size:</strong>
                            </div>
                            <div className="col-lg-7">
                              <Input
                                type="text"
                                placeholder={'Tx Bytes Size'}
                                value={this.state.txByteSize}
                                onChange={event => this.handleInputChange(event.target.value, 'inputTxByteSize')}
                              />
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-lg-5">
                              <strong>Consumed TRX:</strong>
                            </div>
                            <div className="col-lg-7">
                              <Input
                                type="text"
                                value={this.state.txBandwidth}
                                disabled={true}
                                style={{color: '#000000'}}
                              />
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-lg-12 card-body-mtb5">
                              <Collapse bordered={false}>
                                <Panel header={ learnMore } key="1" showArrow={ false }>
                                  <p className="learn-more-content">
                                    <strong>Consume the transaction initiator's TRX, calculated as the number of bytes in the transaction * 10 SUN. </strong>
                                  </p>
                                </Panel>
                              </Collapse>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* tx bandwidth */}
                  <div className="col-xl-12 col-lg-12">
                  <div className="card card--example">
                      <div className="card-header">
                        <h5 className="text-black">
                          <strong className="text-capitalize">{Constant.CALC_BPACCOUNT_TITLE}</strong>
                        </h5>
                      </div>
                      <div className="card-body pb-0">
                        <div className="row">
                          <div className="col-xl-12 col-lg-12">
                            <div id="energy_form card-body-mt10">
                              <div className="row">
                                <div className="col-lg-12">
                                  <div className="row card-body-mb10">
                                    <div className="col-lg-6">
                                      <Input
                                        type="text"
                                        placeholder="Hex Address"
                                        onChange={event => this.handleInputChange(event.target.value, 'inputHexAddressBp')}
                                      />
                                    </div>
                                    <div className="col-lg-6">
                                      <Button type="primary" onClick={event => this.calcMaxBandwidthLimit()}>
                                        Submit
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="row error-msg">
                                    <div className="col-lg-5">
                                      <span>{ this.state.maxBpMsg}</span>
                                    </div>
                                  </div>
                                  <hr/>
                                  <div className="row card-body-mb10">
                                    <div className="col-lg-6">
                                      <strong>Free BP:</strong>
                                    </div>
                                    <div className="col-lg-6">
                                      <Input
                                        type="text"
                                        value={this.state.maxBandwidth.freeBandWidthLimit}
                                        disabled={true}
                                        style={{color: '#000000'}}
                                      />
                                    </div>
                                  </div>
                                  <div className="row card-body-mb10">
                                    <div className="col-lg-6">
                                      <strong>Free BP Used:</strong>
                                    </div>
                                    <div className="col-lg-6">
                                      <Input
                                        type="text"
                                        value={this.state.maxBandwidth.freeBandWidthUsed}
                                        disabled={true}
                                        style={{color: '#000000'}}
                                      />
                                    </div>
                                  </div>
                                  <div className="row card-body-mb10">
                                    <div className="col-lg-6">
                                      <strong>Frozen Trx BP:</strong>
                                    </div>
                                    <div className="col-lg-6">
                                      <Input
                                        type="text"
                                        value={this.state.maxBandwidth.bandWidthLimit}
                                        disabled={true}
                                        style={{color: '#000000'}}
                                      />
                                    </div>
                                  </div>
                                  <div className="row">
                                    <div className="col-lg-6">
                                      <strong>Frozen Trx BP Used:</strong>
                                    </div>
                                    <div className="col-lg-6">
                                      <Input
                                        type="text"
                                        value={this.state.maxBandwidth.bandWidthUsed}
                                        disabled={true}
                                        style={{color: '#000000'}}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
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

export default EnergyCalcForm
