import React, { Component } from 'react';
import { withNamespaces } from 'react-i18next';
import { withRouter } from 'react-router';
import 'antd/dist/antd.css';
import InfiniteScroll from 'react-infinite-scroller';
import { List, Avatar, Button, message, Spin, Alert, Input, Row, Col } from 'antd';
import { getListContacts, deleteContact } from '../../../api/contact';
import ContactDetail from './ContactDetail';

class ListContacts extends Component {
  constructor(props) {
    super(props);

    this.state = {
      contacts: [],
      error: '',
      loading: false,
      hasMore: true,
      page: 1,
      totalContact: 0,
      searchText: '',
      contactDetail: null,
    };
  }

  fetchData = (page, searchText) => {
    getListContacts(page, searchText)
      .then(res => {
        const { contacts } = this.state;
        res.data.result.map(item => {
          contacts.push(item);
        });
        this.setState({
          contacts,
          page,
          loading: false,
          searchText,
        });
        if (res.data.totalContact.length !== 0) {
          this.setState({
            totalContact: res.data.totalContact,
          });
        }
      })
      .catch(error => {
        this.setState({
          error: error.response.data.error,
        });
      });
  };

  componentDidMount() {
    const { page, searchText } = this.state;
    this.fetchData(page, searchText);
  }

  handleInfiniteOnLoad = () => {
    const { t } = this.props;
    let { page, contacts, totalContact, searchText } = this.state;
    const newPage = parseInt(page) + 1;
    this.setState({
      loading: true,
    });

    if (contacts.length >= totalContact) {
      message.warning(t('contact:list_contact.loaded_all'));
      this.setState({
        hasMore: false,
        loading: false,
      });
      return;
    }

    this.fetchData(newPage, searchText);
  };

  setAvatar(avatar) {
    if (avatar) {
      return <Avatar src={avatar} />;
    }

    return <Avatar icon="user" size="large" />;
  }

  handleDeteleContact = e => {
    const contactId = e.target.value;
    deleteContact({ contactId })
      .then(res => {
        this.setState(prevState => ({
          contacts: prevState.contacts.filter(item => item._id != contactId),
          totalContact: prevState.totalContact - 1,
        }));
        message.success(res.data.success);
      })
      .catch(error => {
        message.error(error.response.data.error);
      });
  };

  handleSearch(searchText) {
    let page = 1;

    this.setState({
      contacts: [],
      page,
      loading: true,
      hasMore: true,
      contactDetail: null,
    });

    this.fetchData(page, searchText);
  }

  showContactDetail = e => {
    const userId = e.currentTarget.id;
    for (let i in this.state.contacts) {
      if (this.state.contacts[i]._id == userId) {
        this.setState({
          contactDetail: this.state.contacts[i],
        });
      }
    }
  };

  goToChatScreen = e => {
    this.props.history.push(`/rooms/${e.target.value}`);
    this.props.handleOk();
  };

  render() {
    const { t } = this.props;
    const { error } = this.state;
    const Search = Input.Search;

    return (
      <React.Fragment>
        <h2 className="title-contact">
          {t('contact:list_contact.title_list_contact')} ({this.state.totalContact})
        </h2>
        <Row gutter={16}>
          <Col span={14}>
            <Search
              placeholder={t('contact:list_contact.btn_search_placeholder')}
              enterButton={t('contact:list_contact.btn_search')}
              size="large"
              onSearch={searchText => this.handleSearch(searchText)}
            />
            <div>
              {this.state.contacts.length > 0 ? (
                <div className="infinite-container">
                  {error && <Alert message={t('user:error_title')} type="error" description={error} />}
                  <InfiniteScroll
                    initialLoad={false}
                    pageStart={0}
                    loadMore={this.handleInfiniteOnLoad}
                    hasMore={!this.state.loading && this.state.hasMore}
                    useWindow={false}
                  >
                    <List
                      dataSource={this.state.contacts}
                      renderItem={item => (
                        <List.Item key={item._id}>
                          <a onClick={this.showContactDetail} id={item._id}>
                            <List.Item.Meta
                              avatar={this.setAvatar(item.avatar)}
                              title={item.name}
                              description={item.email}
                              id="list-contact-item"
                            />
                          </a>
                          <Button.Group className="btn-accept">
                            <Button value={item.room_id} type="primary" onClick={this.goToChatScreen}>
                              {t('contact:list_contact.btn_send_message')}
                            </Button>
                            <Button value={item._id} onClick={this.handleDeteleContact}>
                              {t('button.delete')}
                            </Button>
                          </Button.Group>
                        </List.Item>
                      )}
                    >
                      {this.state.loading && this.state.hasMore && (
                        <div className="demo-loading-container">
                          <Spin />
                        </div>
                      )}
                    </List>
                  </InfiniteScroll>
                </div>
              ) : (
                <div className="title-contact-empty">{t('contact:list_contact.no_contact')}</div>
              )}
            </div>
          </Col>
          <Col span={10}>
            <ContactDetail contactDetail={this.state.contactDetail} />
          </Col>
        </Row>
      </React.Fragment>
    );
  }
}

export default withNamespaces(['user', 'contact'])(withRouter(ListContacts));
