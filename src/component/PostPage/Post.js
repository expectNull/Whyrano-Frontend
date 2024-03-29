import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Layout } from '../../utils/Layout/Layout';
import { PostHeader } from '../../utils/Header/Header';
import { UserCard } from '../../utils/UserCard/UserCard';
import LoadingBar from '../../utils/LoadingBar/LoadingBar';
import PostViewer from '../../utils/PostViewer/PostViewer';
import CommentList from '../../utils/CommentList/CommentList';
import MyEditor from '../../utils/MyEditor/MyEditor';
import Like from '../../utils/Like/Like';
import { Alert, AlertDiv } from '../../utils/Alert/Alert';
import './Post.css';
import { Button } from '@mui/material';
import { checkCookie } from '../../utils/checkCookie';

let idx = 0;
function spreadDiv(item) {
  return (
    <div
      key={idx++}
      style={{
        border: '0.5px solid rgb(25, 108, 200)',
        padding: '10px',
        margin: '0 0 20px',
      }}
    >
      <PostViewer className="postviewer" content={item.content} />
      <div style={{ textAlign: 'right' }}>
        <UserCard
          className="usercard"
          name={item.user_nm}
          np={item.user_np}
          status={item.user_status}
          user_id={item.user_id}
        />
        <div className="like-helper">
          <table>
            <tr>
              <td>
                <b>답글이 도움이 되셨나요?</b>
              </td>
              <td>
                <Like className="like" like_cnt={0} post_id={item.post_id} />
              </td>
            </tr>
          </table>
        </div>
      </div>
      <CommentList parent_id={item.post_id} />
    </div>
  );
}
async function getSomething(id, pos) {
  const info = {
    post_id: Number(id),
  };

  return await (
    await axios.post(`${process.env.REACT_APP_API_URL}/${pos}`, info)
  ).data;
}

function PostPage() {
  const [posts, setPosts] = useState(-1);
  const [replys, setreplys] = useState(-1);
  const [html_content, setContent] = useState(-1);
  const { postid } = useParams();
  const [user, setUser] = useState(-1);
  const [myPage, setMyPage] = useState(-1);

  async function updateView() {
    const info = {
      post_id: Number(postid),
    };

    await axios.post(`${process.env.REACT_APP_API_URL}/updateView`, info);
  }

  async function checkMyPost() {
    const info = {
      post_id: Number(postid),
    };

    let cookie = await checkCookie();
    if (cookie === undefined) cookie = false;

    let ret = await (
      await axios.post(`${process.env.REACT_APP_API_URL}/checkUser`, info)
    ).data._KEN;

    setMyPage(cookie === ret);
    setUser(cookie);
  }

  useEffect(() => {
    const getStuff = async () => {
      let temp_ask = await getSomething(postid, 'getAsk');
      if (temp_ask.err !== undefined) {
        // 404 필요.
        window.location.href = '/';
        return;
      }

      let temp_rep = await getSomething(postid, 'getReplys');
      setPosts(temp_ask);
      setreplys(temp_rep);
      await updateView();
    };
    getStuff();
    checkMyPost();
  }, []);

  const editorRef = useRef();

  async function savePost() {
    const info = {
      parent_post_id: postid,
      html_content: html_content,
      type_gb: 1,
    };

    // try catch 로 묶어야 할 듯 이런 것들.
    var response = await (
      await axios.post(process.env.REACT_APP_API_URL + '/setReply', info, {
        withCredentials: true,
      })
    ).data;

    if (response.success !== 1) {
      return response;
    }

    if (response.length === 0) {
      // 여기 wait 혹은 다른 방식으로 하든지 해야 할 수도
      alert('작성이 완료되었습니다.');
      return false;
    }
    console.log(info.html_content);
  }

  useEffect(() => {
    // console.log(html_content);
  }, [html_content]);

  useEffect(async () => {
    if (typeof html_content == 'number') {
      return;
    }

    let ret = await savePost();
    if (ret) {
      alert(ret.err);
      return;
    }
    window.location.href = `/post/${postid}`;
  }, [html_content]);

  const handleSave = async () => {
    const editorInstance = await editorRef.current.getInstance();
    const getContent_html = await editorInstance.getHTML();
    const getContent_md = await editorInstance.getMarkdown();
    if (getContent_md.length == 0) {
      alert('공백입니다.');
      return;
    }
    setContent(getContent_md);
  };

  return (
    <div className="postPage">
      <Layout>
        <div
          style={{
            margin: '10px',
            padding: '10px',
          }}
        >
          {posts === -1 ? (
            <div className="loadingBar">
              <LoadingBar />
            </div>
          ) : (
            <>
              <PostHeader
                post_nm={posts.post_nm}
                ymd={posts.post_ymd}
                view={posts.view_cnt}
                like={posts.like_cnt}
                post_id={postid}
              />
              <PostViewer content={posts.content} />
              <UserCard
                className="usercard"
                name={posts.user_nm}
                np={posts.user_np}
                user_id={posts.user_id}
                status={posts.user_status}
              />
            </>
          )}
          {/* 질문글의 댓글임. */}
          <CommentList parent_id={postid} />
          <hr />
          <h1 className="answer">Answers</h1>
          {/* 답변글들 뿌리기 */}
          {replys === -1 ? (
            <LoadingBar />
          ) : replys.length === 0 ? (
            <div>아직 답변이 작성되지 않았어요..</div>
          ) : (
            replys.map(item => spreadDiv(item))
          )}
          <hr />
          {!user || myPage ? (
            <></>
          ) : (
            <>
              <div>
                <MyEditor
                  // initialProps={'# 답글을 작성해주세요. '}
                  previewProps={'tab'}
                  heightProps={'30vh'}
                  refProps={editorRef}
                />
              </div>
              <Button
                disbaled="true"
                id="save_btn"
                variant="contained"
                onClick={handleSave}
              >
                답글 달기
              </Button>
              <hr />
            </>
          )}
        </div>
      </Layout>
    </div>
  );
}

export default PostPage;
