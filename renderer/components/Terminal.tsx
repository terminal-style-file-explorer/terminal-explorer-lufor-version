'use client';
import { useRouter } from 'next/router';
import {
  CmdNotFound,
  Empty,
  Form,
  Hints,
  Input,
  User,
  Wrapper,
} from './styles/terminal.styled';
import React, { useCallback, useEffect, createContext } from 'react'
import _ from "lodash";
import { SetResult } from './SetResult';
import { themeContext } from '../pages/home';
export type User = {
  name: string;
  password: string;
  auth: number;
};
type Command = {
  cmd: string;
  desc: string;
  tab: number;
}[];
import theme from './styles/themes';
import { argTab } from '../utils/funcs';
import { UsageDiv } from './styles/outout.styled';
import { Cmd } from './styles/help.styled';





export const commands: Command = [
  { cmd: "cls", desc: "clear the terminal", tab: 10 },
  { cmd: "echo", desc: "print out path", tab: 9 },
  { cmd: "help", desc: "check available commands", tab: 9 },
  { cmd: "history", desc: "view command history", tab: 6 },
  // { cmd: "pwd", desc: "print current working directory", tab: 10 },
  { cmd: "themes", desc: "check available themes", tab: 7 },
  { cmd: "adduser", desc: "create an account", tab: 6 },
  { cmd: "su", desc: "change user", tab: 11 },
  { cmd: "cd", desc: "change directory", tab: 11 },
  { cmd: "dir", desc: "list directory contents", tab: 10 },
  { cmd: "note", desc: "enter clue book", tab: 9 },
  { cmd: "mail", desc: "enter mail", tab: 9 },
  { cmd: "options", desc: "check available options", tab: 6 },
  { cmd: "exit", desc: "exit the terminal", tab: 9 },
  { cmd: ":q", desc: "exit docs or mail or note or video", tab: 11 },
  { cmd: "open", desc: "open a file", tab: 9 },
];
type Term = {
  arg: string[];
  CmdHistory: string[];
  index: number;
  clearHistory?: () => void;
};

export const termContext = createContext<Term>({
  arg: [],
  CmdHistory: [],
  index: 0,
});

export default function HomePage() {
  const Router = useRouter();
  const [user, setUser] = React.useState<User>({ name: '', password: '', auth: 0 });
  const [cmdHistory, setCmdHistory] = React.useState([])
  const [inputValue, setInputValue] = React.useState('')
  const [pointer, setPointer] = React.useState(0)
  const [userHistory, setUserHistory] = React.useState([])
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [hints, setHints] = React.useState<string[]>([]);
  const [event, setEvent] = React.useState<JSX.Element[]>([<>input <Cmd>helo</Cmd> to get available commands</>]);
  const [resultHistory, setResultHistory] = React.useState<JSX.Element[]>([]);
  const themeSwitcher = React.useContext(themeContext);
  const [ThemeByResult, setThemeByResult] = React.useState("dark");
  const router = useRouter();

  const handleRouter = (path: string) => {
    router.push(path);
  }

  React.useEffect(() => {
    console.log('ThemeByResult', ThemeByResult);
    themeSwitcher(theme[ThemeByResult]);
  }, [ThemeByResult]);

  React.useEffect(() => {
    console.log('cmdH', cmdHistory);
    console.log('userH', userHistory);
    console.log('resultH', resultHistory);
  }, [cmdHistory, userHistory, resultHistory]);

  React.useEffect(() => {
    if (!localStorage.getItem('user')) {
      Router.push('/login')
    }
    else {
      setUser(JSON.parse(localStorage.getItem('user')))
    }
    window.ipc.invoke('getContents', '');
  }, []);

  const showFoldersNames: () => Promise<string[]> = async () => {
    const items = await window.ipc.invoke('getContentsWithOutFile', '');
    return items;
  }
  const showFilesNames = async () => {
    const items = await window.ipc.invoke('getContentsWithOutFolder', '');
    return items;
  }

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }
    , [inputValue]);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // 阻止默认提交行为
    console.log('userHistory', user.name);
    setUserHistory([...userHistory, user.name])
    setCmdHistory([...cmdHistory, inputValue]);
    SetResult(inputValue,
      resultHistory,
      setResultHistory,
      clearHistory,
      cmdHistory,
      setThemeByResult,
      handleRouter,
      setUser,
      setHints,
    );
    setInputValue('');
    setHints([]);
    setPointer(0);

  };


  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    const ctrlI = e.ctrlKey && e.key.toLowerCase() === "i";
    const ctrlL = e.ctrlKey && e.key.toLowerCase() === "l";

    if (e.key === "ArrowUp") {
      const newPointer = pointer - 1;
      if (Math.abs(newPointer) <= cmdHistory.length) {
        setInputValue(cmdHistory[cmdHistory.length + newPointer]);
        setPointer(newPointer);
        console.log('pointer', newPointer, 'CmdH', cmdHistory.length);
        inputRef?.current?.blur();
      }
    }


    if (e.key === "ArrowDown") {
      if (pointer >= -1) return;
      const newPointer = pointer + 1;
      setInputValue(cmdHistory[cmdHistory.length + newPointer]);
      setPointer(newPointer);
      console.log('pointer', newPointer);
      inputRef?.current?.blur();
    }


    if (e.key === "Tab") {
      console.log('entered tab', inputValue, hints);
      e.preventDefault();
      if (!inputValue) return;
      let hintCmds = [];
      commands.forEach((cmd) => {
        if (_.startsWith(cmd.cmd, inputValue)) {
          hintCmds = [...hintCmds, cmd.cmd];
        }
      });
      const returnedHints = await argTab(inputValue, setInputValue, setHints, hintCmds, showFoldersNames, showFilesNames) as string[];
      console.log('returnedHints', returnedHints)
      hintCmds = returnedHints ? [...hintCmds, ...returnedHints] : hintCmds;

      console.log('hintCmds', hintCmds);

      if (hintCmds.length > 1) {
        setHints(hintCmds);
      }
      else if (hintCmds.length === 1) {
        const currentCmd = _.split(inputValue, ' ');
        setInputValue(
          currentCmd.length !== 1
            ? `${currentCmd[0]} ${currentCmd[1]} ${hintCmds[0]}` : hintCmds[0]
        )

        setHints([]);
      }
      console.log('hint contains: ', hintCmds)
    }



    if (ctrlL) {
      router.push('/videoPlayer/?name=1.mp4');
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
    setResultHistory([]);
    setHints([]);
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
      {/**  <Hint /> */}
      {hints.length > 1 && (
        <div>
          {hints.map(hCmd => (
            <Hints key={hCmd}>{hCmd}</Hints>
          ))}
        </div>
      )}
      <Form onSubmit={handleSubmit} className='flex'>
        <label>
          <User>{user.name ? user.name + "@:  " : "user" + "@:   "}</User>
        </label>
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
        {cmdHistory.map((cmdH, index) => {
          return (
            <div key={_.uniqueId(`${cmdH}_`)}>
              <div key={index}>
                <div id='terminal-info'>
                  <User> {userHistory[index]}</User>
                  <span>@: {cmdH}</span>
                </div>
                <div id='terminal-output'>
                  {resultHistory[index]}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <hr />
      <div className='flex'>
        <span className=''>Hints:</span>
        {event.map((e, index) => {
          return <span key={index}>{e}</span>
        }
        )}
      </div>
    </Wrapper>


  )
}
