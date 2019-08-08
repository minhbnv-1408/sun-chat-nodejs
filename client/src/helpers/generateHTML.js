'use trict';

import React from 'react';
import { Layout, Input, Button, List, Avatar, Icon, Row, Col, Badge, Popover, message, Spin, Tabs } from 'antd';
import { messageConfig, block } from '../config/message';
import avatarConfig from '../config/avatar';
import { getUserAvatarUrl, getEmoji } from './../helpers/common';
import configEmoji from '../config/emoji';
import InfiniteScroll from 'react-infinite-scroller';
import { Link } from 'react-router-dom';
import handlersMessage from './handlersMessage';
import { room } from '../config/room';
import ModalSetNicknames from '../components/modals/room/ModalSetNicknames';

const { TabPane } = Tabs;

export function getReplyMessageContent(component, message) {
  const { nicknames, messageIdEditing } = component.state;
  const currentUserInfo = component.props.userContext.info;

  let replyMessageContent = component.createMarkupMessage(message);
  let notificationClass = message.is_notification ? 'pre-notification' : '';
  let isToMe =
    replyMessageContent.__html.includes(`data-tag="[To:${currentUserInfo._id}]"`) ||
    replyMessageContent.__html.includes(`data-tag="[rp mid=${currentUserInfo._id}]"`) ||
    replyMessageContent.__html.includes(messageConfig.SIGN_TO_ALL);
  let reactionOfMsg = component.reactionDupplicateCounter(message.reactions);

  return (
    <div
      key={message._id}
      ref={element => (component.attr.messageRowRefs[message._id] = element)}
      className="wrap-message"
    >
      <Row
        key={message._id}
        className={
          (messageIdEditing === message._id ? 'message-item isEditing wrap-reply-msg' : 'message-item wrap-reply-msg',
          isToMe ? 'timelineMessage--mention wrap-reply-msg' : 'wrap-reply-msg')
        }
        onMouseEnter={component.handleMouseEnter}
        onMouseLeave={component.handleMouseLeave}
        id={message._id}
      >
        <Col span={20}>
          <List.Item className="li-message">
            <Popover
              placement="topLeft"
              trigger="click"
              text={message.user_info.name}
              content={generateMsgContent(component, message.user_info)}
              onVisibleChange={component.handleVisibleChange(message.user_info._id)}
            >
              <div data-user-id={message.user_info._id}>
                <List.Item.Meta
                  className="show-infor"
                  avatar={
                    <Avatar size={avatarConfig.AVATAR.SIZE.MEDIUM} src={getUserAvatarUrl(message.user_info.avatar)} />
                  }
                  title={
                    <p>
                      {nicknames[message.user_info._id] ? nicknames[message.user_info._id] : message.user_info.name}
                    </p>
                  }
                />
              </div>
            </Popover>
          </List.Item>
          <div className="infor-content">
            <pre
              className={'timelineMessage__message ' + notificationClass}
              dangerouslySetInnerHTML={replyMessageContent}
            />
            {reactionOfMsg.length > 0 ? (
              <div className="_reaction timelineMessage__reactionDisplayContainer" style={{ display: 'flex' }}>
                {reactionOfMsg.map(value => {
                  return configEmoji.REACTION[value.reaction.reaction_tag] ? (
                    <span
                      className="reactionButton reactionButton--myReaction _sendReaction _showDescription"
                      aria-label="Remove this reaction"
                      data-reactiontype="yes"
                    >
                      <img
                        src={getEmoji(configEmoji.REACTION[value.reaction.reaction_tag].image)}
                        alt={value.reaction.reaction_tag}
                        className="reactionButton__emoticon"
                      />
                      <span className="reactionButton__count _reactionCount">{value.count}</span>
                    </span>
                  ) : (
                    ''
                  );
                })}
              </div>
            ) : (
              ''
            )}
          </div>
        </Col>
        <Col span={4} className="message-time">
          <h4>
            {component.formatMsgTime(message.updatedAt)}{' '}
            {message.updatedAt !== message.createdAt ? (
              <span>
                <Icon type="edit" />
              </span>
            ) : (
              ''
            )}
          </h4>
        </Col>
      </Row>
    </div>
  );
}

export function generateReactionMsg(component, msgId) {
  const listReaction = configEmoji.REACTION;
  const { t } = component.props;
  const content = (
    <div id="_reactionList" className="reactionSelectorTooltip">
      <ul className="reactionSelectorTooltip__emoticonList">
        {Object.entries(listReaction).map(([key, reaction]) => {
          return (
            <li className="reactionSelectorTooltip__itemContainer" key={key}>
              <span className="reactionSelectorTooltip__item">
                <span className="reactionSelectorTooltip__emoticonContainer">
                  <Avatar
                    className="reactionSelectorTooltip__emoticon image-emoji"
                    src={getEmoji(reaction.image)}
                    alt={key}
                    title={t(reaction.tooltip)}
                    onClick={() => component.handleReaction(msgId, key)}
                  />
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return content;
}

export function generateReactionUserList(component, msgId, reactionOfMsg) {
  return (
    <div className="reactionUserListTollTip">
      <Tabs activeKey={component.state.activeKeyTab} onChange={component.onChangeTab}>
        {reactionOfMsg.map((value, index) => {
          return (
            <TabPane
              tab={
                <div onClick={() => component.fetchReactionUserList(msgId, value.reaction.reaction_tag)}>
                  <img
                    src={getEmoji(configEmoji.REACTION[value.reaction.reaction_tag].image)}
                    alt={value.reaction.reaction_tag}
                    className="reactionButton__emoticon"
                  />
                  <span className="reactionButton__count _reactionCount">{value.count}</span>
                </div>
              }
              key={index}
            >
              {component.contentReactionUserList(msgId, value.reaction.reaction_tag)}
            </TabPane>
          );
        })}
      </Tabs>
    </div>
  );
}

export function generateListEMoji(component) {
  const listEmoji = configEmoji.EMOJI;
  const { t } = component.props;
  const content = (
    <div className="member-infinite-container" style={{ width: '210px' }}>
      <InfiniteScroll initialLoad={false} pageStart={0} loadMore={component.handleInfiniteOnLoad} useWindow={false}>
        <div className="box-emoji">
          {Object.entries(listEmoji).map(([key, emoji]) => {
            return (
              <p className="line-emoji" key={key}>
                <Avatar
                  className="image-emoji"
                  src={getEmoji(emoji.image)}
                  alt={key}
                  title={t(emoji.tooltip)}
                  onClick={component.handleEmoji}
                />
              </p>
            );
          })}
        </div>
      </InfiniteScroll>
    </div>
  );

  return content;
}

export function generateMsgContent(component, infoUserTip) {
  const { t } = component.props;
  const userId = infoUserTip._id ? infoUserTip._id : null;
  const myChatId = component.props.userContext.my_chat_id;
  const currentUserId = component.props.userContext.info._id;
  const directRoomId = component.state.directRoomIds[userId];
  const receivedRequestUser = component.state.receivedRequestUsers[userId];
  const sendingRequestUser = component.state.sendingRequestUsers[userId];
  let button = <Spin />;

  if (userId == currentUserId) {
    button = (
      <Link to={`/rooms/${myChatId}`}>
        <Button>{component.props.t('title.my_chat')}</Button>
      </Link>
    );
  } else if (directRoomId === undefined) {
    button = '';
  } else {
    button = directRoomId ? (
      <Link to={`/rooms/${directRoomId}`}>
        <Button>{component.props.t('title.direct_chat')}</Button>
      </Link>
    ) : sendingRequestUser ? (
      <div>
        <Button value={userId} onClick={component.handleRejectContact}>
          {component.props.t('title.reject_request')}
        </Button>
        <Button value={userId} onClick={component.handleAcceptContact}>
          {component.props.t('title.accept_request')}
        </Button>
      </div>
    ) : receivedRequestUser ? (
      <Button value={userId} onClick={component.handleCancelRequest}>
        {component.props.t('title.cancel_request')}
      </Button>
    ) : (
      <Button value={userId} onClick={component.handleSendRequestContact}>
        {component.props.t('title.add_contact')}
      </Button>
    );
  }

  return (
    <div className="popover-infor">
      <div className="infor-bg">
        <Avatar src={getUserAvatarUrl(infoUserTip.avatar)} className="infor-avatar" />
      </div>
      <div style={{ minHeight: '55px' }}>
        <p className="infor-name">{infoUserTip.name ? infoUserTip.name : t('loading')}</p>
        <p>{infoUserTip.email ? infoUserTip.email : ''}</p>
      </div>
      <div className="infor-footer">
        <div>{<List.Item style={{ minHeight: '35px' }}>{button}</List.Item>}</div>
      </div>
    </div>
  );
}

export function generateRedLine(component) {
  const { t } = component.props;

  return (
    <div className={'timeLine__unreadLine'} ref={element => (component.attr.unreadMsgLineRef = element)}>
      <div className="timeLine__unreadLineBorder">
        <div className="timeLine__unreadLineContainer">
          <div className="timeLine__unreadLineBody">
            <span className="timeLine__unreadLineText">{t('unread_title')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function generateListTo(component) {
  const { t, allMembers, roomInfo } = component.props;
  const currentUserInfo = component.props.userContext.info;
  const content =
    allMembers == [] ? (
      <span>{t('not_data')}</span>
    ) : (
      <React.Fragment>
        <div className="member-infinite-container">
          {roomInfo.type == room.ROOM_TYPE.GROUP_CHAT && (
            <a className="form-control to-all" href="javascript:;" onClick={handlersMessage.actionFunc.toAll}>
              <span>{t('to_all')}</span>
            </a>
          )}
          <InfiniteScroll initialLoad={false} pageStart={0} loadMore={component.handleInfiniteOnLoad} useWindow={false}>
            <List
              dataSource={allMembers}
              renderItem={member => {
                return member._id != currentUserInfo._id ? (
                  <List.Item key={member._id}>
                    <List.Item.Meta
                      avatar={<Avatar size={avatarConfig.AVATAR.SIZE.SMALL} src={getUserAvatarUrl(member.avatar)} />}
                      title={
                        <a onClick={handlersMessage.actionFunc.toMember} href="javascript:;" data-mid={member._id}>
                          {member.nickname ? member.nickname.nickname : member.name}
                        </a>
                      }
                    />
                  </List.Item>
                ) : (
                  <span />
                );
              }}
            />
          </InfiniteScroll>
        </div>
        <ModalSetNicknames hidePopoverTo={component.hidePopoverTo} members={allMembers} />
      </React.Fragment>
    );

  return content;
}
