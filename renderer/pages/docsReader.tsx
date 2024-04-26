import { createContext, useEffect, useState,useRef } from "react";
import { DefaultTheme, ThemeProvider } from "styled-components";
import { useTheme } from "../hooks/useTheme";
import GlobalStyle from "../components/styles/GlobalStyle";
import { themeContext } from './home';
import { useRouter } from "next/router";
import mammoth from "mammoth";
import { Container, Form, Input, User } from "../components/styles/terminal.styled";
import { Cmd, KeyContainer } from "../components/styles/help.styled";

function DocsReader() {
  const { theme, themeLoaded, setMode } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState(theme);
  const [doc, setDoc] = useState("");
  const router = useRouter();
  const { name } = router.query;


  console.log('doc name', name)

  // Disable browser's default behavior
  // to prevent the page go up when Up Arrow is pressed


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
    setSelectedTheme(switchTheme);
    setMode(switchTheme);
  };

  useEffect(() => {
    const doc = window.ipc.invoke('getDocs', name);
    doc.then((res) => {
      mammoth.convertToHtml({ arrayBuffer: res }).then((result) => {
        setDoc(result.value);
      });
    });
  }, [name]);


  const [inputValue, setInputValue] = useState('');


  const [user, setUser] = useState({ name: '', password: '', auth: 0 });
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue === ':wq') {
      router.push('/home');
    }
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    inputRef.current.focus();
  }
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      window.scrollBy(0, -50); // 向上滚动50个像素
    }
    // 按下箭头向下
    else if (e.key === "ArrowDown") {
      window.scrollBy(0, 50); // 向下滚动50个像素
    }
  };
  const contentRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!localStorage.getItem('user')) {
      router.push('/login')
    }
    else {
      setUser(JSON.parse(localStorage.getItem('user')))
    }
  }, []);

  return (
    <div onKeyDown={handleKeyDown} >
      {themeLoaded && (
        <ThemeProvider theme={selectedTheme}>
          <GlobalStyle theme={selectedTheme} />
          <themeContext.Provider value={themeSwitcher}>
            <Container>
              <div dangerouslySetInnerHTML={{ __html: doc }} />
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
                <div>Submit <Cmd>exit</Cmd> back to home</div>
                <div>Tab <Cmd>Tab</Cmd> change focus</div>
                </KeyContainer>
            </Container>
          </themeContext.Provider>
        </ThemeProvider>
      )}
    </div>
  )
}
export default DocsReader;