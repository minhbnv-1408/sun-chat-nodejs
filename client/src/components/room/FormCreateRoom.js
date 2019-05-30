import React, { PureComponent } from 'react';
import { withNamespaces } from 'react-i18next';
import { withRouter } from 'react-router';
import 'antd/dist/antd.css';
import ListContactCreateRoom from './ListContactsCreateRoom.js';
import { createRoom } from '../../api/room.js';
import { roomConfig } from '../../config/roomConfig';
import { Row, Col, Card, Form, Input, Icon, Button, Modal, message, Checkbox, Upload, Typography } from 'antd';

const FormItem = Form.Item;
const { TextArea } = Input;
const { Paragraph } = Typography;

class FormCreateRoom extends PureComponent {
  static defaultProps = {
    handleModalVisible: () => {},
    invitationURL: roomConfig.INVITATION_URL,
  };

  constructor(props) {
    super(props);

    this.state = {
      previewVisible: false,
      previewImage: '',
      fileList: [],
      invitationCode: Math.random()
        .toString(36)
        .substring(2, 35),
      isChangeLink: false,
      invitationType: 0,
      members: [],
      errors: {},
    };
  }

  rules = {
    name: [
      {
        required: false,
        message: this.props.t('validate.amount_char', {
          min: roomConfig.CHAR_MIN,
          max: roomConfig.CHAR_MAX,
        }),
        min: roomConfig.CHAR_MIN,
        max: roomConfig.CHAR_MAX,
      },
    ],
    invitation_code: [
      {
        required: true,
        message: this.props.t('validate.amount_char', {
          min: roomConfig.CHAR_MIN,
          max: roomConfig.CHAR_MAX,
        }),
        min: roomConfig.CHAR_MIN,
        max: roomConfig.CHAR_MAX,
      },
      {
        pattern: '^[A-Za-z0-9_-]*$',
        message: this.props.t('validate.format_char'),
      },
    ],
  };

  handleCancelPreview = () => this.setState({ previewVisible: false });

  handlePreview = file => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  };

  handleChangeAvatar = info => {
    const types = roomConfig.IMG_TYPES;

    if (types.every(type => info.file.type !== type)) {
      message.error(
        this.props.t('validate.img_type', {
          types: roomConfig.IMG_TYPES.join(', '),
        })
      );

      return;
    }

    if (info.file.size / 1024 / 1024 > roomConfig.IMG_MAX_SIZE) {
      message.error(
        this.props.t('validate.img_size', {
          max: roomConfig.IMG_MAX_SIZE,
        })
      );

      return;
    }

    this.setState({ fileList: info.fileList });
  };

  handleCancelSubmit = () => {
    this.setState({
      fileList: [],
      isChangeLink: false,
      errors: {},
    });
    this.props.handleModalVisible();
  };

  handleSubmit = () => {
    const { form, handleModalVisible } = this.props;
    const { members, invitationType, invitationCode, fileList } = this.state;

    const roles = form.getFieldsValue();

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      let roomVals = { ...fieldsValue, ...{ invitation_type: invitationType } };

      if (!fieldsValue.invitation_code) {
        roomVals = { ...roomVals, ...{ invitation_code: invitationCode } };
      }

      if (this.state.fileList.length > 0) {
        roomVals = { ...roomVals, ...{ avatar: fileList[0].thumbUrl } };
      }

      let room = { ...roomVals, ...{ members } };

      createRoom(room)
        .then(response => {
          form.resetFields();
          this.setState({
            fileList: [],
            isChangeLink: false,
          });
          message.success(response.data.message);
          handleModalVisible();
        })
        .catch(err => {
          if (err.response.data.error) {
            message.error(err.response.data.error);
          } else {
            this.setState({
              errors: err.response.data,
            });

            if (err.response.data.invitation_code) {
              this.setState({
                isChangeLink: true,
              });
            }
          }
        });
    });
  };

  showFormEditInvitationLinkRoom = flag => {
    this.setState({
      isChangeLink: flag,
      errors: {},
    });
  };

  handleEditInvitationLinkRoom = () => {
    const { form } = this.props;

    form.validateFields(['invitation_code'], (err, values) => {
      if (err) return;

      this.setState({
        invitationCode: values.invitation_code,
        isChangeLink: false,
      });
    });
  };

  adminApproves = e => {
    this.setState({
      invitationType: e.target.checked
        ? roomConfig.INVITATION_TYPE.NEED_APPROVAL
        : roomConfig.INVITATION_TYPE.NOT_NEED_APPROVAL,
    });
  };

  render() {
    const { t, form, modalVisible, handleModalVisible, invitationURL } = this.props;
    const { previewVisible, previewImage, fileList, invitationCode, isChangeLink, checkedList, errors } = this.state;
    let invitationLink = invitationURL + invitationCode;
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">{t('title.upload')}</div>
      </div>
    );
    const formInvitationLinkRoom = (
      <Row>
        <Col span={3}>
          <Button type="link">{t('title.link_share')}:</Button>
        </Col>
        <Col span={19}>
          <Input defaultValue={invitationLink} readOnly />
        </Col>
        <Col span={1}>
          <Paragraph style={{ marginTop: '5px' }} copyable={{ text: invitationLink }} />
        </Col>
        <Col span={1}>
          <Button icon="edit" onClick={() => this.showFormEditInvitationLinkRoom(true)} />
        </Col>
      </Row>
    );
    const formEditInvitationLinkRoom = (
      <Row>
        <Col span={3}>
          <Button type="link">{t('link_share')}:</Button>
        </Col>
        <Col span={19} style={{ display: 'flex' }}>
          <span style={{ margin: '7px 0 0 25px', textAlign: 'right' }}>{invitationURL}</span>
          <FormItem
            key="invitation_code"
            style={{ margin: '-4px 5px 0 0' }}
            help={
              form.getFieldError('invitation_code') ? (
                form.getFieldError('invitation_code')
              ) : errors && errors.invitation_code ? (
                <span className="error-message-from-server">{errors.invitation_code}</span>
              ) : (
                ''
              )
            }
          >
            {form.getFieldDecorator('invitation_code', {
              initialValue: invitationCode,
              rules: this.rules.invitation_code,
            })(<Input onChange={() => this.setState({ errors: {} })} />)}
          </FormItem>
        </Col>
        <Col span={1}>
          <Button icon="check" onClick={this.handleEditInvitationLinkRoom} />
        </Col>
        <Col span={1}>
          <Button type="link" icon="close" onClick={() => this.showFormEditInvitationLinkRoom(false)} />
        </Col>
      </Row>
    );

    return (
      <Modal
        destroyOnClose
        title={t('title.create_room')}
        visible={modalVisible}
        onOk={this.handleSubmit}
        onCancel={this.handleCancelSubmit}
        okText={t('button.submit')}
        cancelText={t('button.cancel')}
        width="750px"
      >
        <Form className="createRoom-form">
          <Row type="flex" justify="end" align="middle">
            <Col span={4}>
              <Upload
                name="avatar"
                listType="picture-card"
                className="avatar-uploader"
                fileList={fileList}
                onPreview={this.handlePreview}
                beforeUpload={() => false}
                onChange={this.handleChangeAvatar}
              >
                {fileList.length >= 1 ? null : uploadButton}
              </Upload>
              {errors && errors.avatar ? <span className="error-message-from-server">{errors.avatar}</span> : ''}
              <Modal visible={previewVisible} footer={null} onCancel={this.handleCancelPreview}>
                <img alt="{t('avatar')}" style={{ width: '100%' }} src={previewImage} />
              </Modal>
            </Col>
            <Col span={20}>
              <FormItem
                key="name"
                help={
                  form.getFieldError('name') ? (
                    form.getFieldError('name')
                  ) : errors && errors.name ? (
                    <span className="error-message-from-server">{errors.name}</span>
                  ) : (
                    ''
                  )
                }
              >
                {form.getFieldDecorator('name', {
                  initialValue: '',
                  rules: this.rules.name,
                })(<Input placeholder={t('title.room_name')} />)}
              </FormItem>
              <div style={{ margin: '24px 0' }} />
              <FormItem key="desc">
                {form.getFieldDecorator('desc', {
                  initialValue: '',
                })(<TextArea placeholder={t('title.room_des')} autosize={{ minRows: 2, maxRows: 6 }} />)}
              </FormItem>
            </Col>
            <Col span={24}>
              <Card title={t('title.add_member')} bordered={false}>
                <ListContactCreateRoom getMembers={members => this.setState({ members })} />
              </Card>
            </Col>
          </Row>
          {isChangeLink ? formEditInvitationLinkRoom : formInvitationLinkRoom}
          <Checkbox style={{ margin: '20px 0 0 20px' }} onChange={this.adminApproves}>
            {t('title.admin_confirm')}
          </Checkbox>
        </Form>
      </Modal>
    );
  }
}

FormCreateRoom = Form.create()(FormCreateRoom);

export default withNamespaces(['room'])(withRouter(FormCreateRoom));
