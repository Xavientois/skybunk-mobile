import React from 'react';
import PropTypes from 'prop-types';
import { View, Platform, TouchableOpacity, Modal } from 'react-native';
import {
  Container, Left, Right, Body, Content, Card,
  CardItem, Text, Thumbnail, Button, Icon
} from 'native-base';
import _ from 'lodash';
import { Font, AppLoading } from "expo";
import date from 'date-fns';

import CreateResourceModal from '../CreateResourceModal/CreateResourceModal';
import ApiClient from '../../ApiClient';
import styles from "./PostStyle";

export default class Post extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      profilePicture: null,
      showEditButtons: false,
      editing: false,
    }
  }

  async componentWillMount() {
    await Font.loadAsync({
      Roboto: require("native-base/Fonts/Roboto.ttf"),
      Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf")
    });

    ApiClient.get(`/users/${this.props.data.author._id}/profilePicture`, {}).then(pic => {
      this.setState({
        profilePicture: pic,
      });
    }).catch(error => {
      console.log(error);
    });
  }

  onPressOptions = () => {
    this.setState({ showEditButtons: true });
  }

  hideEditButtons = () => {
    this.setState({ showEditButtons: false });
  }

  onPressEdit = () => {
    this.setState({ editing: true })
    this.hideEditButtons();
  }

  saveEdited = (newContent) => {
    const { updatePost, data } = this.props;
    var postId = data._id;

    this.closeEditingModal();

    updatePost && updatePost(postId, { content: newContent });
  }

  closeEditingModal = () => {
    this.setState({ editing: false });
  }

  onPressDelete = () => {
    const { updatePost, data } = this.props;

    var postId = data._id;

    this.hideEditButtons();

    updatePost && updatePost(postId, {}, "deletePost");
  }

  onPressPost = () => {
    // Call parent to navigate
    var { onPressPost, data } = this.props;
    if (onPressPost) onPressPost(data);
  }

  toggleLike = () => {
    const {
      updatePost,
      data: postData
    } = this.props;

    updatePost && updatePost(postData._id, postData, 'toggleLike');
  }

  getEditButtonJSX() {
    const { enableEditing } = this.props;

    if (enableEditing) return (
      <View style={styles.headerRight}>
        <TouchableOpacity onPress={this.onPressOptions} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
          <Icon style={styles.icon} type='MaterialIcons' name='more-vert' />
        </TouchableOpacity>
      </View>
    )
    return null;
  }

  render() {
    const {
      showEditButtons,
      editing
    } = this.state;

    const {
      data
    } = this.props;

    var {
      author,
      content,
      likes,
      isLiked,
      comments,
      createdAt,
      tags,
    } = data;

    var likeIcon = isLiked ? require('../../assets/liked-cookie.png') : require('../../assets/cookie-icon.png');

    // In case author account is deleted
    var authorName;
    if (!author) authorName = "Ghost";
    else authorName = `${author.firstName} ${author.lastName}`;

    // TODO: implement
    var authorPhoto = author.profilePicture;

    createdAt = date.format(createdAt, 'ddd MMM Do [at] h:mma');
    var numComments = comments ? comments.length : 0;
    var likes = likes ? likes : 0;

    return (
      <View>
        <Card style={styles.card}>

          <CardItem>
            {/* Using flexbox here because NativeBase's Left/Body/Right isn't as customizable */}
            <View style={styles.headerContainer}>

              <View style={styles.headerLeft}>
                <View>
                  <Thumbnail style={styles.profilePicThumbnail} source={{ uri: `data:image/png;base64,${this.state.profilePicture}` }} />
                </View>
                <View style={styles.headerBody}>
                  <View style={styles.authorDetails}>
                    <Text>{authorName}</Text>
                    <Text>{this.props.showTag ? ` ►  ${tags[0]}` : null}</Text>
                  </View>
                  <Text note>{createdAt}</Text>
                </View>
              </View>

              {this.getEditButtonJSX()}

            </View>
          </CardItem>

          <CardItem button onPress={this.onPressPost} style={styles.postContent}>
            <Body>
              {/* {this.getImageJSX()} */}
              <Text numberOfLines={this.props.maxLines} ellipsizeMode='tail'>{content}</Text>
            </Body>
          </CardItem>

          <CardItem style={styles.postFooter}>
            <Left>
              <TouchableOpacity onPress={this.toggleLike}>
                <View style={styles.iconContainer}>
                  <Thumbnail small square source={likeIcon} style={styles.icon} />
                  <Text>{`${likes}`}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={this.onPressPost}>
                <View style={styles.iconContainer}>
                  <Thumbnail small square source={require('../../assets/comments-icon.png')} style={styles.icon} />
                  <Text>{`${numComments}`}</Text>
                </View>
              </TouchableOpacity>
            </Left>
          </CardItem>

        </Card>

        <View>
          <Modal
            animationType="slide"
            transparent={true}
            visible={showEditButtons}
            onRequestClose={this.hideEditButtons}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={styles.editButtonsContainer}
              onPress={this.hideEditButtons}
            >
              <View style={styles.view}>
                <Button block style={styles.editButton} onPress={this.onPressEdit}>
                  <Text>Edit Post</Text>
                </Button>
                <Button block style={styles.deleteButton} onPress={this.onPressDelete}>
                  <Text>Delete Post</Text>
                </Button>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>

        <CreateResourceModal
          onClose={this.closeEditingModal}
          isModalOpen={editing}
          saveResource={this.saveEdited}
          existing={content}
          submitButtonText='Save'
        />
      </View>
    )
  }
}