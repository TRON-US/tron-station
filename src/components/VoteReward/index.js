import React from 'react'
import { Input, Select, Button, Radio, Table } from 'antd'
import './style.scss'

// services
import Api from "services/api.js";
import EventEmitter from "services/eventEmitter.js";
import _ from "lodash";
import * as Constant from 'utils/constant.js'

const Option = Select.Option;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

const srTableColumns = [
  { title: <strong>Rank</strong>, width:50,  dataIndex: 'rank', key: 'rank', fixed: 'left' },
  { 
    title: <strong>SR</strong>, width:210,  dataIndex: 'name', key: 'name', fixed: 'left', 
    onFilter: (value, record) => record.name.indexOf(value) === 0, 
    render: (text, record) => <a style={{color:'#db3747'}} href={record.url}
    target="_blank"
    rel="noopener noreferrer">{text}</a>
  },
  { 
    title: <strong># of Votes</strong>, width:130, dataIndex: 'votes', key: 'votes' ,filterMultiple: false,
    sorter: (a, b) => a.votes - b.votes, sortDirections: ['descend', 'ascend'],
    render: (text, record) => <span>{text.toLocaleString()}</span>
  },
  { 
    title: <strong>% of Votes</strong>, width:130,  dataIndex: 'votesPercentage', key: 'votesPercentage', 
    render: (text, record) => <span>{text}%</span>
  },
  { 
    title: <strong>Vote Reward (TRX)</strong>, width:130,  dataIndex: 'voteReward', key: 'voteReward',
    render: (text, record) => <span>{text.toLocaleString()}</span>
  },
  { 
    title: <strong>Block Reward (TRX)</strong>, width:130,  dataIndex: 'blockReward', key: 'blockReward',
    render: (text, record) => <span>{text.toLocaleString()}</span>
  },
  { 
    title: <strong>Total Reward (TRX)</strong>,  dataIndex: 'totalReward', key: 'totalReward',
    render: (text, record) => <span>{text.toLocaleString()}</span>
  }
];


class SRVoteForm extends React.Component {
  constructor(props) {
    super(props);
    this.api = new Api()
    this.state = {
      srData: [],
      candidateData: [],
      allData: [],
      queryData: [],
      listData: [],
      totalVotes: 0,
      tabIdx: 0,
      dialogOpen: false,
      isSrChecked: false,
      addedVotes: 0,
      srQuery: '',
      srSelect: null,
      srSelectContent: '',
      calcReward: {},
      formulaState: false,
      anchorElState: null,
      formula: '',
      tabVal: 'SR'
    };
  }

  componentDidMount() {
    let thiz = this;
    this.getSuperRepresentatives();
    EventEmitter.subscribe('changeNet', function() {
      thiz.api = new Api()
      thiz.setState({
        srData: [],
        candidateData: [],
        allData: [],
        queryData: [],
        totalVotes: 0,
        tabIdx: 0,
        dialogOpen: false,
        isSrChecked: false,
        tabVal: 'SR',
        srQuery: '',
        srSelect: null,
        listData: [],
        srSelectContent: '',
        calcReward: {},
        formulaState: false,
        anchorElState: null,
        formula: ''
      });
      thiz.getSuperRepresentatives();
    });
  }

  componentWillUnmount() {
    EventEmitter.unSubscribe('changeNet');
  }

  handleInputChange = (event, name, value) => {
    switch (name) {
      case 'addedVotes':
        this.setState({ [name]: event.target.value });
        break;
      case 'tabIdx':
        this.setState({ [name]: this.state.tabIdx === 0 ? 1 : 0 });
        break;
      case 'srQuery':
        this.setState({
          queryData: _.filter(this.state.allData, function(d) {
            return d.name.indexOf(event.target.value) !== -1;
          })
        });
        break;
      case 'srSelect':
        if (value === -1) {
          this.setState({
            srSelect: null
          });
        } else {
          this.setState({
            srSelect: this.state.allData[value]
          });
        }
        break;
      default:
        break;
    }
  };

  async getSuperRepresentatives() {
    let data = await this.api.getSuperRepresentatives();
    this.setState({
      srData: data.srData,
      candidateData: data.candidateData,
      allData: data.allData,
      queryData: data.allData,
      totalVotes: data.totalVotes,
      listData: data.srData
    });
  }

  calcVoteReward() {
    let addedVotes = parseInt(
      this.state.addedVotes === '' ? 0 : this.state.addedVotes,
      0
    );
    let totalSrVotes = addedVotes;
    if (this.state.srSelect != null) {
      totalSrVotes += this.state.srSelect.votes;
    }

    let ascData = _.reverse(_.clone(this.state.allData));
    let pos = _.sortedIndexBy(ascData, { votes: totalSrVotes }, function(d) {
      return d.votes;
    });
    let rank = addedVotes === 0
        ? this.state.allData.length - pos
        : this.state.allData.length - pos + 1;

    let srName = this.state.srSelect !== null
      ? this.state.srSelect.name
      : rank <= 27
        ? 'New SR'
        : 'New Candidate';
    let totalVotes = this.state.totalVotes + addedVotes;
    let percentage = ((100 * totalSrVotes) / totalVotes).toFixed(6);
    let voteReward = Math.ceil(16 * 20 * 60 * 24 * (totalSrVotes / totalVotes));
    let blockReward =
      rank <= this.state.srData.length
        ? Math.ceil((32 * 20 * 60 * 24) / this.state.srData.length)
        : 0;
    let totalReward = blockReward + voteReward;
    let rewardObj = {
      rank: rank,
      sr: srName,
      votes: totalSrVotes.toLocaleString(),
      totalVotes: totalVotes.toLocaleString(),
      percentage: percentage + '%',
      voteReward: voteReward.toLocaleString(),
      blockReward: blockReward.toLocaleString(),
      totalReward: totalReward.toLocaleString()
    };
    this.setState({ calcReward: rewardObj });
  }

  handleSelectChange(value) {
    this.setState({tabVal: value});
    if (value === 'SR') {
      this.setState({listData: this.state.srData});
    } else {
      this.setState({listData: this.state.candidateData});
    }
  }
  
  render() {
    return (
      <div className="FormDemo">
        <div className="row">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <div className="utils__title">
                  <strong>{Constant.SRVOTE_TITLE}</strong>
                </div>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-xl-4 col-lg-12">
                    <div className="card card--example">
                      <div className="card-header">
                        <h5 className="text-black">
                          <strong className="text-capitalize">{Constant.SRVOTE_CUSVOTE_TITLE}</strong>
                        </h5>
                      </div>
                      <div className="card-body pb-0">
                        <p className="card-body-custv-desp">
                          <span className="card-body-mb10">A SR Total Vote rewards is composed of Vote reward and Block Reward. </span><br/>
                          <strong>● Vote Rewards:</strong> 16 (trx/block) * 20 (blocks/min) * 60 (min/hour) * 6 (hours/election) * 4 (elections/day) = 460,800 (trx/day).<br/>
                          <span className="card-body-mb5">
                            &nbsp;&nbsp;&nbsp;For each candidate, Vote Rewards = 460,800 * (# votes / # total votes)<br/>
                          </span>
                          <strong>● Block Rewards:</strong> 32 (trx/block) x 20 (blocks/min) x 60 (min/hour) x 24 (hours/day) = 921,600 (trx/Day)<br/>
                        </p>
                      </div>
                      
                      <div className="card-body pb-0">
                        <div className="row card-body-custv-layout" layout="inline">
                          <div className="col-lg-5">
                            <Input
                              type="text"
                              placeholder={'New Votes / SR Votes+'}
                              onChange={event => this.handleInputChange(event, "addedVotes")}
                            />
                          </div>
                          <div className="col-lg-4">
                            <Select
                              showSearch
                              style={{ width: '100%' }}
                              placeholder="Select SR"
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                            >
                              <Option
                                key={-1}
                                onClick={event =>
                                  this.handleInputChange(event, "srSelect", -1)
                                }
                              >
                                Select SR
                              </Option>
                              {this.state.queryData.map((row, index) => {
                                return (
                                  <Option
                                    key={index}
                                    value={index}
                                    onClick={event =>
                                      this.handleInputChange(event, "srSelect", index)
                                    }
                                  >
                                    {row.name.toString()}
                                  </Option>
                                );
                              })}
                            </Select>
                          </div>
                          <div className="col-lg-3" >
                            <Button type="primary" onClick={event => this.calcVoteReward()}>
                              Submit
                            </Button>
                          </div>
                        </div>
                        <hr/>
                        <div className="row card-body-custv-table" layout="inline">
                          <div className="table100 ver2 m-b-110" >
                            <div className="table100-head">
                              <table>
                                <thead>
                                  <tr className="row100 head">
                                    <th className="cell100 column1"><font style={{ fontSize: '1.1rem'}}>Prediction</font></th>
                                    <th className="cell100 column2"></th>
                                  </tr>
                                </thead>
                              </table>
                            </div>
                            <div className="table100-body js-pscroll">
                              <table>
                                <tbody>
                                  <tr className="row100 body">
                                    <td className="cell100 column1">Rank</td>
                                    <td className="cell100 column2">{this.state.calcReward.rank === undefined ? '-' : this.state.calcReward.rank}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                            <div className="table100-body js-pscroll">
                              <table>
                                <tbody>
                                  <tr className="row100 body">
                                    <td className="cell100 column1">SR</td>
                                    <td className="cell100 column2">{this.state.calcReward.sr === undefined ? '-' : this.state.calcReward.sr}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                            <div className="table100-body js-pscroll">
                              <table>
                                <tbody>
                                  <tr className="row100 body">
                                    <td className="cell100 column1"># of Votes</td>
                                    <td className="cell100 column2">{this.state.calcReward.votes === undefined ? '-' : this.state.calcReward.votes}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                            <div className="table100-body js-pscroll">
                              <table>
                                <tbody>
                                  <tr className="row100 body">
                                    <td className="cell100 column1">Total Votes</td>
                                    <td className="cell100 column2">{this.state.calcReward.totalVotes === undefined ? '-' : this.state.calcReward.totalVotes}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                            <div className="table100-body js-pscroll">
                              <table>
                                <tbody>
                                  <tr className="row100 body">
                                    <td className="cell100 column1">% of Votes</td>
                                    <td className="cell100 column2">{this.state.calcReward.percentage === undefined ? '-' : this.state.calcReward.percentage}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                            <div className="table100-body js-pscroll">
                              <table>
                                <tbody>
                                  <tr className="row100 body">
                                    <td className="cell100 column1">Votes Reward</td>
                                    <td className="cell100 column2">{this.state.calcReward.voteReward === undefined ? '-' : this.state.calcReward.voteReward}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                            <div className="table100-body js-pscroll">
                              <table>
                                <tbody>
                                  <tr className="row100 body">
                                    <td className="cell100 column1">Block Reward</td>
                                    <td className="cell100 column2">{this.state.calcReward.blockReward === undefined ? '-' : 
                                        this.state.calcReward.blockReward === 0 ? 'N/A' : this.state.calcReward.blockReward}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                            <div className="table100-body js-pscroll">
                              <table>
                                <tbody>
                                  <tr className="row100 body">
                                    <td className="cell100 column1">Total Reward</td>
                                    <td className="cell100 column2">{this.state.calcReward.totalReward === undefined ? '-' : this.state.calcReward.totalReward}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* current vote reward */}
                  <div className="col-xl-8 col-lg-12">
                    <div className="card card--example">
                      <div className="card-header">
                        <h5 className="text-black">
                          <strong className="text-capitalize">SR votes reward</strong>
                        </h5>
                      </div>
                      <div className="card-body pb-0">
                        <div className="card-body-mb25">
                          <div>
                            <RadioGroup onChange={event => this.handleSelectChange(event.target.value)} value={this.state.tabVal}>
                              <RadioButton value={'SR'}>SR</RadioButton>
                              <RadioButton value={'Candidate'}>Candidate</RadioButton>
                            </RadioGroup>
                            <span style={{float: 'right', verticalAlign: 'middle'}}>
                              <span className="font-grey-14">Total Votes:</span> <span className="font-black-30 ">{this.state.totalVotes.toLocaleString()}</span>
                            </span>
                          </div>
                        </div>
                        <Table columns={srTableColumns} dataSource={this.state.listData} scroll={{x: 800, y: 610 }} rowKey="rank"  pagination={false}/>
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

export default SRVoteForm
