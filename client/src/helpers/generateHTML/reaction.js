'use trict';

import React from 'react';
import { Avatar, Tabs } from 'antd';
import configEmoji from '../../config/emoji';
import { getEmoji } from './../../helpers/common';

const { TabPane } = Tabs;

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
