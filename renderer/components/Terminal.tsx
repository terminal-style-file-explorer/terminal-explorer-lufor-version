import { useRouter } from 'next/router';
import {
  CmdNotFound,
  Empty,
  Form,
  Hints,
  Input,
  Wrapper,
} from './styles/terminal.styled';
import React, { useCallback, useEffect } from 'react'

type User = {
  name: string;
  password: string;
  auth: number;
};


export default function HomePage() {
  const Router = useRouter();
  const [user, setUser] = React.useState<User>({ name: '', password: '', auth: 0 });
  const [cmdHistory, setCmdHistory] = React.useState([])
  const [inputValue, setInputValue] = React.useState('')
  const [pointer, setPointer] = React.useState(-1)
  const [userHistory, setUserHistory] = React.useState([])
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [hints, setHints] = React.useState<string[]>([]);
  /*   React.useEffect(() => {
      if (!localStorage.getItem('user')) {
        Router.push('/login')
      }
    }) */

  React.useEffect(() => {
    if (!localStorage.getItem('user')) {
      setUser({ name: 'user', password: '', auth: 0 })
    }
    else {
      setUser(JSON.parse(localStorage.getItem('user')))
    }
  }
    , []);
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }
    , [inputValue]);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // 阻止默认提交行为
    setCmdHistory([...cmdHistory, inputValue]);
    setUserHistory([...userHistory, user.name])
    setInputValue('');
    setHints([]);
    setPointer(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      // setInputValue(inputValue + "  ")
    }
    if (e.key === "ArrowUp") {
      if (pointer >= cmdHistory.length) return;
      if (pointer + 1 === cmdHistory.length) return;
      setInputValue(cmdHistory[pointer + 1]);
      setPointer(pointer + 1);
      inputRef?.current?.blur();
    }
    if (e.key === "ArrowDown") {
      if (pointer < 0) return;

      if (pointer === 0) {
        setInputValue("");
        setPointer(-1);
        return;
      }

      setInputValue(cmdHistory[pointer - 1]);
      setPointer(prevState => prevState - 1);
      inputRef?.current?.blur();
    }

  }

  // For caret position at the end
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef?.current?.focus();
    }, 1);
    return () => clearTimeout(timer);
  }, [inputRef, inputValue, pointer]);


  const clearHistory = () => {
    setCmdHistory([]);
    setUserHistory([]);
  }

  const handleDivClick = () => {
    inputRef.current && inputRef.current.focus();
  };
  useEffect(() => {
    document.addEventListener("click", handleDivClick);
    return () => {
      document.removeEventListener("click", handleDivClick);
    };
  }, [containerRef]);

  return (
    <Wrapper ref={containerRef} className=''>
      <Form onSubmit={handleSubmit} className='flex'>
        <label>{user.name ? user.name + "@:  " : "user" + "@:   "}</label>
        <Input title="terminal-input " className='w-full flex-1'
          type="text"
          id='terminal-input'
          autoFocus
          spellCheck="false"
          value={inputValue}
          onKeyDown={handleKeyDown}
          onChange={handleChange}
          ref={inputRef}
        />
      </Form>
      <div id='history' className=''>
        {cmdHistory.map((item, index) => (
          <div key={index}>{userHistory[userHistory.length - 1]}@: {item}</div>
        ))}
      </div>

    </Wrapper>


  )
}
