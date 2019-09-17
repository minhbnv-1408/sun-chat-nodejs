import React from 'react';
import { deleteRoom, leaveRoom } from '../../api/room';
import { withNamespaces } from 'react-i18next';
import history from '../../history';
import { room } from '../../config/room';
import {
  Layout,
  Menu,
  Icon,
  Button,
  Dropdown,
  message,
  Typography,
  Avatar,
  Row,
  Col,
  Divider,
  Tooltip,
  Modal,
  Input,
} from 'antd';
import ModalListRequest from '../modals/room/ModalListRequest';
import ModalListMember from '../modals/room/ModalListMember';
import ModalListNotMember from '../modals/room/ModalListNotMember';
import EditRoom from './EditRoom';
import { deleteContact } from '../../api/contact';
import { SocketContext } from './../../context/SocketContext';
import { withUserContext } from './../../context/withUserContext';
import { withRouter } from 'react-router';
import { getUserAvatarUrl, getRoomAvatarUrl } from './../../helpers/common';
import avatarConfig from '../../config/avatar';

const { Header } = Layout;

const { Text } = Typography;

class HeaderOfRoom extends React.Component {
  static contextType = SocketContext;
  state = {
    memberOfRoom: [],
    visibleEnterPasswordModal: false,
  };
  componentWillReceiveProps(nextProps) {
    this.setState({ memberOfRoom: nextProps.data.members_info });
  }
  componentDidMount() {
    const socket = this.context.socket;
    socket.on('edit_room', () => {});
    socket.on('change_member_count', () => {});
    this.context.socket.on('update_member_of_room', memberOfRoom => {
      this.setState({ memberOfRoom });
    });
  }

  showRepresentativeMembers = () => {
    let listMember = [];
    const data = this.props.data;
    const limitShowMember = room.LIMIT_REPRESENTATIVE_MEMBER;

    if (data.type === room.ROOM_TYPE.GROUP_CHAT) {
      if (data.number_of_members > limitShowMember) {
        listMember.push(<ModalListMember key={0} numRemainMember={data.number_of_members - limitShowMember} />);
      } else {
        listMember.push(<ModalListMember key={0} numRemainMember="" />);
      }

      this.state.memberOfRoom.map(member => {
        listMember.push(
          <Avatar
            size={avatarConfig.AVATAR.SIZE.SMALL}
            key={member._id}
            src={getUserAvatarUrl(member.avatar)}
            className={`list-member-chat-room _avatarHoverTip _avatarClickTip avatarClickTip _avatar _avatar_Uid_${
              member._id
            }`}
          />
        );
      });
    }

    return listMember;
  };

  handleDeleteRoom = () => {
    const roomId = this.props.data._id;
    deleteRoom({ roomId })
      .then(res => {
        message.success(res.data.success);
        history.goBack();
      })
      .catch(error => {
        message.error(error.response.data.error);
      });
  };

  handleLeaveTheRoom = e => {
    const myChatId = this.props.userContext.my_chat_id;
    const roomId = this.props.data._id;
    let historyProp = this.props.history;

    leaveRoom(roomId)
      .then(res => {
        historyProp.push('/rooms/' + myChatId);
      })
      .catch(error => {
        message.error(error.response.data.error);
      });
  };

  handleDeteleContact = e => {
    const contactId = e.target.value;
    const myChatId = this.props.userContext.my_chat_id;

    deleteContact({ contactId })
      .then(res => {
        this.props.history.push('/rooms/' + myChatId);
      })
      .catch(error => {
        message.error(error.response.data.error);
      });
  };

  showEnterPasswordModal = () => {
    this.setState({
      visibleEnterPasswordModal: true,
    });
  };

  hiddenEnterPasswordModal = () => {
    this.setState({
      visibleEnterPasswordModal: false,
    });
  };

  render() {
    const { t, data } = this.props;
    let buttonLeaveRoom = '';
    let directChatId = 0;

    if (typeof data == 'object') {
      for (let i = 0; i < data.members_info.length; i++) {
        if (data.members_info[i]._id !== this.props.userContext.info._id) {
          directChatId = data.members_info[i]._id;
          break;
        }
      }
    }

    if (data.type === room.ROOM_TYPE.DIRECT_CHAT) {
      buttonLeaveRoom = (
        <Button value={directChatId} onClick={this.handleDeteleContact}>
          {t('button.remove_contact')}
        </Button>
      );
    } else {
      buttonLeaveRoom = <Button onClick={this.handleLeaveTheRoom}>{t('button.left-room')}</Button>;
    }

    return (
      <Header className="header-chat-room">
        <Row type="flex" justify="start">
          <Col xl={19} xs={12}>
            <Avatar
              size={30}
              src={
                data.type === room.ROOM_TYPE.GROUP_CHAT
                  ? getRoomAvatarUrl(this.props.data.avatar)
                  : getUserAvatarUrl(this.props.data.avatar)
              }
              className="avatar-room-chat"
            />
            <Text strong className="name-chat-room">
              {this.props.data.name}
            </Text>
            <Tooltip placement="top" title={t('title.password_in_room')} className="setting-password">
              <Button type="primary" shape="circle" icon="check-circle" onClick={this.props.handleShowModal} />
            </Tooltip>

            <Modal
              title={t('title.password_modal')}
              visible={this.props.visibleEnterPasswordModal}
              onOk={this.props.submitPassword}
              onCancel={this.props.handleCancelModal}
            >
              <Input placeholder={t('title.password_modal')} type="password" onChange={this.props.updatePassword} />
            </Modal>
          </Col>
          <Col xl={5} xs={12}>
            <div className="option-header-room">
              {this.showRepresentativeMembers()}
              {this.props.isAdmin && (
                <React.Fragment>
                  <Divider type="vertical" />
                  <ModalListRequest roomId={data._id} />
                  <ModalListNotMember />
                </React.Fragment>
              )}
              {data.type !== room.ROOM_TYPE.MY_CHAT && (
                <React.Fragment>
                  <Divider type="vertical" />
                  <Dropdown
                    placement="bottomCenter"
                    overlay={
                      <Menu className="menu-room-config">
                        {this.props.isAdmin && (
                          <Menu.Item>
                            <EditRoom roomInfo={data} />
                          </Menu.Item>
                        )}
                        {this.props.isAdmin && (
                          <Menu.Item>
                            <Button onClick={this.handleDeleteRoom}>{t('button.delete-room')}</Button>
                          </Menu.Item>
                        )}
                        <Menu.Item>{buttonLeaveRoom}</Menu.Item>
                      </Menu>
                    }
                  >
                    <Icon type="setting" className="icon-setting-room" theme="outlined" />
                  </Dropdown>
                </React.Fragment>
              )}
            </div>
          </Col>
        </Row>
      </Header>
    );
  }
}

export default withRouter(withNamespaces(['room'])(withUserContext(HeaderOfRoom)));
