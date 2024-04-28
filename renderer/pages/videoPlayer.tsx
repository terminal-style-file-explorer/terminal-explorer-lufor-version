import { createContext, useEffect, useState } from "react";
import { DefaultTheme, ThemeProvider } from "styled-components";
import { useTheme } from "../hooks/useTheme";
import GlobalStyle from "../components/styles/GlobalStyle";
import { themeContext } from './home';
import { useRouter } from "next/router";
import ReactPlayer from "react-player";
import { Container, Form, Hints, Input, User } from "../components/styles/terminal.styled";
import { useRef } from "react";
import { Cmd, KeyContainer } from "../components/styles/help.styled";

function VideoPlayer() {
  const { theme, themeLoaded, setMode } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState(theme);
  const router = useRouter();
  const { name } = router.query;
  const [videoPath, setVideoPath] = useState('');


  useEffect(() => {
    setSelectedTheme(theme);
  }, [themeLoaded]);

  // Update meta tag colors when switching themes
  useEffect(() => {
    const themeColor = theme.colors?.body;

    const metaThemeColor = document.querySelector("meta[name='theme-color']");
    const maskIcon = document.querySelector("link[rel='mask-icon']");
    const metaMsTileColor = document.querySelector(
      "meta[name='msapplication-TileColor']"
    );

    metaThemeColor && metaThemeColor.setAttribute("content", themeColor);
    metaMsTileColor && metaMsTileColor.setAttribute("content", themeColor);
    maskIcon && maskIcon.setAttribute("color", themeColor);
  }, [selectedTheme]);

  const themeSwitcher = (switchTheme: DefaultTheme) => {
    setMode(switchTheme);
  };


  useEffect(() => {
    const fetchVideoPath = async () => {
      const path = await window.ipc.invoke('getVideo', name);
      setVideoPath(path);
    };

    fetchVideoPath();
  }, [name]);

  const [inputValue, setInputValue] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  

  const [user, setUser] = useState({ name: '', password: '', auth: 0 });
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (inputValue === ':q') {
      router.push('/home');
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }


  useEffect(() => {
    if (!localStorage.getItem('user')) {
      router.push('/login')
    }
    else {
      setUser(JSON.parse(localStorage.getItem('user')))
    }
  }, []);

  return (
    < div >
      {themeLoaded && (
        <ThemeProvider theme={selectedTheme}>
          <GlobalStyle theme={selectedTheme} />
          <themeContext.Provider value={themeSwitcher}>
            <Container >
              <div ref={contentRef} style={{ width: '100%', paddingTop: '56.25%', position: 'relative' }}>
                <ReactPlayer
                  url={`http://localhost:8881/${videoPath}`}
                  controls={true}
                  width="100%"
                  height="100%"
                  style={{ position: 'absolute', top: 0, left: 0 }}

                />
              </div>
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
                  onChange={handleChange}
                  ref={inputRef}
                />
              </Form>
              <KeyContainer>
                <div>Submit <Cmd>:q</Cmd> back to home</div>
                <div>Tab <Cmd>Arrow Up/Down</Cmd> key to change focus</div>
              </KeyContainer>
            </Container>

          </themeContext.Provider>
        </ThemeProvider>
      )}
    </div>
  )
}

export default VideoPlayer;