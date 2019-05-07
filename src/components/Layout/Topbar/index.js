import React from 'react'
import { Menu, Dropdown } from 'antd'
// import { setNetState } from 'ducks/app'
import './style.scss'


// services
import netRouter from "services/netRouter.js";
import EventEmitter from "services/eventEmitter.js";
import Api from "services/api.js";

class TopBar extends React.Component {

  constructor(props) {
    super(props);
    this.api = new Api();
    this.state = { net: netRouter.getNet().name, currentNet: netRouter.getNet().desp };
  }

  componentDidMount() {
    this.getResourceInfo();
  }

  handleChangeNet(item) {
    let val = item.key;
    if ((this.state.currentNet === 'Main Net' && val === 'MainNet') || (this.state.currentNet === 'Test Net' && val === 'ShastaNet')) {
       return;
    }
    if (val === 'MainNet') {
      this.setState({currentNet: 'Main Net'});
    } else {
      this.setState({currentNet: 'Test Net'});
    }
    this.setState({
      net: val
    });
    netRouter.setNet(val);
    this.api.setUpTronWeb();
    this.getResourceInfo();
    EventEmitter.dispatch('changeNet', val);
  }

  async getResourceInfo() {
    let resource = await this.api.getAccountResources();
    let blockNum = await this.api.getLastUpdateBlock();
    if (resource) {
      this.setState({
        totalEnergyWeight:
          'TotalEnergyWeight' in resource
            ? resource.TotalEnergyWeight.toLocaleString()
            : 0,
        totalNetWeight:
          'TotalNetWeight' in resource
            ? resource.TotalNetWeight.toLocaleString()
            : 0,
        block: blockNum.toLocaleString()
      });
    } else {
      this.setState({
        totalEnergyWeight:
          0,
        totalNetWeight:
          0,
        block: 0
      });
    }
    
  }

  render() {
    const menu = (
      <Menu selectable={false} openKeys={this.state.openKeys}>
        <Menu.Item key="MainNet" onClick={thiz => this.handleChangeNet(thiz)}>
          <a className="menuSelect" href onClick={(e) => {e.preventDefault();}}>Main Net</a>
        </Menu.Item>
        <Menu.Item key="ShastaNet" onClick={thiz => this.handleChangeNet(thiz)}>
          <a className="menuSelect" href onClick={(e) => {e.preventDefault();}}>Test Net</a>
        </Menu.Item>
      </Menu>
    )
    return (
      <div className="topbar">
        <div className="topbar__left">
          <span className="topbar__title">Last Block: </span>{this.state.block}
          <span className="topbar__title">Total Energy Weight: </span>{this.state.totalEnergyWeight}
          <span className="topbar__title">Total Net Weight: </span>{this.state.totalNetWeight}
        </div>
        <div className="topbar__right">
          <div className="topbar__dropdown d-inline-block mr-4">
            <Dropdown overlay={menu} trigger={['click']} placement="bottomLeft">
              <a className="ant-dropdown-link" href="/">
                <i className="icmn-menu mr-2 topbar__dropdownIcon" />
                <span className="d-none d-xl-inline">
                  <strong><font style={{fontSize: '14px', color: '#000'}}>{this.state.currentNet}</font></strong>
                </span>
              </a>
            </Dropdown>
          </div>
        </div>
      </div>
    )
  }
}

export default TopBar
