import { createContext, useEffect, useState } from "react";
import { DefaultTheme, ThemeProvider } from "styled-components";
import { useTheme } from "../hooks/useTheme";
import GlobalStyle from "../components/styles/GlobalStyle";
import { themeContext } from './home';
import { useRouter } from "next/router";
import ReactPlayer from "react-player";

function VideoPlayer() {
  const { theme, themeLoaded, setMode } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState(theme);
  const router = useRouter();
  const { name } = router.query;
  const [videoPath, setVideoPath] = useState('');


  // Disable browser's default behavior
  // to prevent the page go up when Up Arrow is pressed
  useEffect(() => {
    window.addEventListener(
      "keydown",
      e => {
        ["ArrowUp", "ArrowDown"].indexOf(e.code) > -1 && e.preventDefault();
      },
      false
    );
  }, []);

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
    const fetchVideoPath = async () => {
      const path = await window.ipc.invoke('getVideo', name);
      setVideoPath(path);
      alert(path);
    };

    fetchVideoPath();
  }, [name]);

  return (
    <>
      {themeLoaded && (
        <ThemeProvider theme={selectedTheme}>
          <GlobalStyle theme={selectedTheme} />
          <themeContext.Provider value={themeSwitcher}>
            <div style={{ width: '100%', paddingTop: '56.25%', position: 'relative' }}>
              <ReactPlayer
                url={`http://localhost:8881/${videoPath}`}
                controls={true}
                width="100%"
                height="100%"
                style={{ position: 'absolute', top: 0, left: 0 }}
              />
            </div>
            
          </themeContext.Provider>
        </ThemeProvider>
      )}
    </>
  )
}

export default VideoPlayer;