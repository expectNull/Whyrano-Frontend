import React, { useRef, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import MyEditor from '../../utils/MyEditor/MyEditor';
import Tag from '../../utils/Tag/Tag';

import './EditorPage.css';
// ㅅㅂ 이거 함수 안에 어떻게 넣냐
let tags = {};

function getAll() {
  let ret = [];
  console.log(tags);
  for (let tag in tags) {
    ret.push(tag);
  }
  return ret;
}

function EditorPage(props) {
  const [title, setTitle] = useState('');
  const [ProId, setProId] = useState('');
  const [html_content, setContent] = useState('');
  // let tags = {};
  const editorRef = useRef();

  async function savePost() {
    const info = {
      title: title,
      tags: getAll(tags),
      html_content: html_content,
      user_id: 1,
      problem_id: Number(ProId),
      type_gb: 0,
      //view_cnt -> mysql 초기값 0 설정
      //kind_point_amt -> 초기값 -1 설정 VS NULL
      //PARENT_POST_ID -> NULL
    };
    var response = await axios.post(
      process.env.REACT_APP_API_URL + '/setpost',
      info,
    );
    if (response.data.length === 0) {
      alert('작성이 완료되었습니다.');
    }
    return response;
  }

  const onTitleChange = e => {
    e.preventDefault();
    setTitle(e.target.value);
  };
  const onProIdChange = e => {
    e.preventDefault();
    setProId(e.target.value);
  };
  const onKeyUp = e => {
    let tagValue = e.target.value;
    if (e.keyCode === 13 && tagValue.trim() !== '') {
      const tagInput = document.querySelector('#tag_txt');
      const tagWrap = document.querySelector('#tag_list');
      const tagDiv = document.createElement('div');
      tagDiv.className = 'tags';

      tagDiv.addEventListener('click', () => {
        tagWrap.removeChild(tagDiv);
        delete tags[tagValue];
      });

      tagDiv.innerHTML = tagValue;
      tagWrap.appendChild(tagDiv);
      tags[tagValue] = 1;
      tagInput.value = '';
    }
  };
  const handleSave = async () => {
    if (title.length == 0) {
      alert('제목은 공백일 수 없습니다.');
      return;
    }
    const editorInstance = await editorRef.current.getInstance();
    const getContent_html = await editorInstance.getHTML();
    setContent(getContent_html);
  };

  useEffect(async () => {
    if (html_content.length != 0) {
      await savePost();
      window.location.href = `/`;
    }
  }, [html_content]);
  return (
    <div className="layout">
      <div className="EditorForm">
        <input
          type="text"
          id="title_txt"
          placeholder="제목을 입력하세요"
          onChange={onTitleChange}
          value={title}
        />

        <div className="tagGroup">
          <input
            type="text"
            id="problem_id_txt"
            placeholder="문제 번호 입력"
            onChange={onProIdChange}
          />
          <input
            type="text"
            id="tag_txt"
            placeholder="태그 입력"
            onKeyUp={onKeyUp}
          />

          <div id="tag_container">
            <div id="tag_list"></div>
          </div>
        </div>
        <MyEditor
          // initialProps={'# 내용을 입력해주세요. '}
          previewProps={'vertical'}
          refProps={editorRef}
          widthProps={'100vh'}
          heightProps={'75vh'}
        />
        <br />

        <Button id="save_btn" onClick={handleSave} variant="contained">
          Save
        </Button>
      </div>
    </div>
  );
}

export default EditorPage;
