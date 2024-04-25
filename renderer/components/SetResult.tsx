import React from "react";
import _ from "lodash";
import { CmdNotFound, Empty, Hints } from "./styles/terminal.styled";
import { Cls } from './commands2/Cls';
import { Help } from "./commands2/Help";
import { History } from "./commands2/History";
import { checkThemeSwitch } from "../utils/funcs";
import theme from '../components/styles/themes'
import { ThemesInvalid } from "./commands2/Themes";
const myTheme = _.keys(theme);
import { UsageDiv } from "./styles/outout.styled";
import { Cmd } from "./styles/help.styled";
import { User } from "./Terminal";
import { setUserToLS } from "../utils/storage";
import { commands } from "./Terminal";

type Command = {
    cmd: string;
    desc: string;
    tab: number;
}[];



export async function SetResult(
    input: string,
    resultHistory: any,
    setResuleHistory: React.Dispatch<any>,
    clearHistory, CmdHistory: string[],
    setThemeByResult,
    handleRouter,
    setUser,
    setHints) {
    //处理input
    const commandArray = _.split(_.trim(input), ' ');
    const validCommand = _.find(commands, { cmd: commandArray[0] });
    const command = commandArray[0];
    const arg = _.drop(commandArray);
    //呼出对应的功能/输出
    // const specialCmds = ["themes", "mail"];
    let historytoReturn = <Empty />;
    const setHistorytoReturn = (Element: JSX.Element) => {
        historytoReturn = Element;
    }
    const themeToReturn = (theme: string) => {
        setThemeByResult(theme)
    }
    const notFinished = () => {
        return <div>Not finished</div>
    }

    function checkUser(user: User) {
        try {
            const response = window.ipc.invoke('checkUser', user);
            return response;
        } catch (err) {
            console.log(err);
            const response = 'Error checking user';
            return response;
        }
    }

    function addUser(user: User) {
        try {
            const response = window.ipc.invoke('addUser', user);
            return response;
        } catch (err) {
            console.log(err);
            const response = 'Error adding user';
            return response;
        }
    }

    function getPath() {
        try {
            const response = window.ipc.invoke('getContentPath', 'contentPath');
            return response;
        } catch (err) {
            console.log(err);
            const response = 'Error reading directory';
            return response;
        }
    }

    function showFilesAndFoldersNames() {
        try {
            const response = window.ipc.invoke('getContents', 'contentPath');
            return response;
        } catch (err) {
            console.log(err);
            const response: string[] = ['Error reading directory'];
            return response;
        }
    }

    if (input === "") {
        setHistorytoReturn(<Empty />);
        setResuleHistory([...resultHistory, historytoReturn])
    }
    else if (validCommand) {
        switch (command) {
            case "cls":
                if (arg.length === 0) {
                    clearHistory();
                }
                else {
                    Cls(arg, clearHistory, setHistorytoReturn);
                    setResuleHistory([...resultHistory, historytoReturn])

                }
                break;
            case "echo":
                const path = await getPath();
                setHistorytoReturn(<UsageDiv>{path}</UsageDiv>)
                setResuleHistory([...resultHistory, historytoReturn])
                break;
            case "help":
                Help(setHistorytoReturn);
                setResuleHistory([...resultHistory, historytoReturn])
                break;
            case "history":
                History(setHistorytoReturn, CmdHistory);
                setResuleHistory([...resultHistory, historytoReturn])
                break;
            case "themes":
                if (checkThemeSwitch(commandArray, myTheme)) {
                    //themeSwitcher([theme[commandArray[2]]]);
                    console.log("theme switcher");
                    themeToReturn(commandArray[2]);
                    setHistorytoReturn(<Empty />)
                    setResuleHistory([...resultHistory, historytoReturn])
                }
                else {
                    console.log("theme invalid");
                    ThemesInvalid(setHistorytoReturn, myTheme);
                    setResuleHistory([...resultHistory, historytoReturn])
                }
                break;
            case "adduser":
                if (arg.length === 2 && arg[0] && arg[1]) {
                    const userToAdd = { name: arg[0], password: arg[1], auth: 0 };
                    const addUserResponse = await addUser(userToAdd);
                    if (addUserResponse) {
                        setHistorytoReturn(<UsageDiv> user added as {arg[0]}</UsageDiv>)
                        setUser(userToAdd);
                        setUserToLS(userToAdd);
                        setResuleHistory([...resultHistory, historytoReturn])
                    }
                    else {
                        setHistorytoReturn(<UsageDiv>user already exists</UsageDiv>)
                        setResuleHistory([...resultHistory, historytoReturn])
                    }
                }
                else {
                    setHistorytoReturn(<UsageDiv>please input: <Cmd>adduser `username` `password`</Cmd></UsageDiv>)
                    setResuleHistory([...resultHistory, historytoReturn])
                }

                break;
            case "su":
                if (arg.length === 2 && arg[0] && arg[1]) {
                    const userToCheck = { name: arg[0], password: arg[1], auth: 0 };
                    const checkUserResponse = await checkUser(userToCheck);
                    if (checkUserResponse) {
                        setHistorytoReturn(<Empty />)
                        setUser(userToCheck);
                        setUserToLS(userToCheck);
                        setResuleHistory([...resultHistory, historytoReturn])
                    }
                    else {
                        setHistorytoReturn(<UsageDiv>please check your username or password</UsageDiv>)
                        setResuleHistory([...resultHistory, historytoReturn])
                    }
                }
                else {
                    setHistorytoReturn(<UsageDiv>please input: <Cmd>su `username` `password`</Cmd></UsageDiv>)
                    setResuleHistory([...resultHistory, historytoReturn])
                }

                break;
            case "cd":
                if (arg.length === 1) {
                    const result = await window.ipc.invoke('changeDirectory', arg[0]);
                    console.log('result in invoke changedir', result);
                    if (result) {
                        setHistorytoReturn(<UsageDiv>cd: {arg} success</UsageDiv>)
                        setResuleHistory([...resultHistory, historytoReturn])
                    }
                    else {
                        setHistorytoReturn(<UsageDiv>cd: no such directory: {arg[0]}</UsageDiv>)
                        setResuleHistory([...resultHistory, historytoReturn])
                    }
                }
                else {
                    setHistorytoReturn(<UsageDiv>please input: <Cmd>cd `foldername`</Cmd></UsageDiv>)
                    setResuleHistory([...resultHistory, historytoReturn])
                }
                break;
            case "dir":
                const dir = await showFilesAndFoldersNames();
                setHistorytoReturn(<UsageDiv>{
                    dir.map((item, index) => {
                        return <Hints key={index}>{item} </Hints>
                    })
                }</UsageDiv>)
                setResuleHistory([...resultHistory, historytoReturn])
                break;
            case "note":
                if (arg.length === 0) {
                    handleRouter('/note');
                    setHistorytoReturn(<Empty />)
                    setResuleHistory([...resultHistory, historytoReturn])
                }
                else {
                    setHistorytoReturn(<UsageDiv>Would you like to input: <Cmd>note</Cmd></UsageDiv>)
                    setResuleHistory([...resultHistory, historytoReturn])
                }
                break;
            case "mail":
                if (arg.length === 0) {
                    handleRouter('/mail');
                    setHistorytoReturn(<Empty />)
                    setResuleHistory([...resultHistory, historytoReturn])
                } else {
                    setHistorytoReturn(<UsageDiv>Would you like to input: <Cmd>mail</Cmd></UsageDiv>)
                    setResuleHistory([...resultHistory, historytoReturn])
                }
                break;
            case "options":
                setResuleHistory([...resultHistory, notFinished()])
                break;
            case "open":
                if (arg.length === 1) {
                    const result = await window.ipc.invoke('checkFile', arg[0]);
                    console.log('result in invoke checkFile', result);
                    if (result) {
                        const fileType = arg[0].split('.')[1];
                        if (fileType === 'docx') {
                            setHistorytoReturn(<Empty />)
                            setResuleHistory([...resultHistory, historytoReturn])
                            handleRouter(`/docsReader/?name=${arg[0]}`)
                        } else if (fileType === 'mp4' || fileType === 'mp3' || fileType === 'wav') {
                            setHistorytoReturn(<Empty />)
                            setResuleHistory([...resultHistory, historytoReturn])
                            handleRouter(`/videoPlayer/?name=${arg[0]}`)
                        } else {
                            setHistorytoReturn(<UsageDiv>not support type</UsageDiv>)
                            setResuleHistory([...resultHistory, historytoReturn])

                        }
                    }
                    else {
                        setHistorytoReturn(<UsageDiv>open: no such file: {arg[0]}</UsageDiv>)
                        setResuleHistory([...resultHistory, historytoReturn])
                    }
                }
                else {
                    setHistorytoReturn(<UsageDiv>please input: <Cmd>open `filename`</Cmd></UsageDiv>)
                    setResuleHistory([...resultHistory, historytoReturn])
                }
                break;
            case "exit":
                if (arg.length === 0) {
                    window.ipc.invoke('exit', '');
                }
                else {
                    setHistorytoReturn(<UsageDiv>please input: <Cmd>exit</Cmd></UsageDiv>)
                    setResuleHistory([...resultHistory, historytoReturn])
                }
                break;
            default:
                break;
        }
    }
    else {
        setHistorytoReturn(<CmdNotFound >
            command not found: {input}
        </CmdNotFound>)
        setResuleHistory([...resultHistory, historytoReturn])
    }












    /*const historytoReturn = <div>
         <div>Command: {input}</div>
         <div>Result: {validCommand ? validCommand.desc : "Command not found"}</div>
         <div>Arguments: {arg}</div>
     </div>;
     */
    //接下来处理input

    // setResuleHistory([...resultHistory, historytoReturn])

}