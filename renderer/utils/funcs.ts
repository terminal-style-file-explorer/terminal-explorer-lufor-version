import _ from "lodash";
import theme from "../components/styles/themes";

/**
 * Generates html tabs
 * @param {number} num - The number of tabs
 * @returns {string} tabs - Tab string
 */
export const generateTabs = (num = 0): string => {
  let tabs = "\xA0\xA0";
  for (let i = 0; i < num; i++) {
    tabs += "\xA0";
  }
  return tabs;
};


/**
* Check current render makes redirect for theme
* @param {boolean} rerender - is submitted or not
* @param {string[]} currentCommand - current submitted command
* @param {string[]} themes - the command of the function
* @returns {boolean} redirect - true | false
*/
export const checkThemeSwitch = (
  currentCommand: string[],
  themes: string[]
): boolean =>
  currentCommand[0] === "themes" && // current command starts with 'themes'
  currentCommand[1] === "set" && // first arg is 'set'
  currentCommand.length > 1 && // current command has arg
  currentCommand.length < 4 && // if num of arg is valid (not `themes set light sth`)
  _.includes(themes, currentCommand[2]); // arg last part is one of id




/**
* Perform advanced tab actions
* @param {string} inputVal - current input value
* @param {(value: React.SetStateAction<string>) => void} setInputVal - setInputVal setState
* @param {(value: React.SetStateAction<string[]>) => void} setHints - setHints setState
* @param {hintsCmds} hintsCmds - hints command array
* @returns {string[] | undefined} hints command or setState action(undefined)
*/
export const argTab = async (
  inputVal: string,
  setInputVal: (value: React.SetStateAction<string>) => void,
  setHints: (value: React.SetStateAction<string[]>) => void,
  hintsCmds: string[],
  showFilesAndFoldersNames: () => Promise<string[]>,
  showFilesNames: () => Promise<string[]>
): Promise<string[] | undefined> => {
  // 1) if input is 'themes '
  if (inputVal === "themes ") {
    setInputVal(`themes set`);
    return [];
  }

  // 2) if input is 'themes s'
  else if (
    _.startsWith("themes", _.split(inputVal, " ")[0]) &&
    _.split(inputVal, " ")[1] !== "set" &&
    _.startsWith("set", _.split(inputVal, " ")[1])
  ) {
    setInputVal(`themes set`);
    return [];
  }

  // 3) if input is 'themes set '
  else if (inputVal === "themes set ") {
    setHints(_.keys(theme));
    return [];
  }

  // 4) if input starts with 'themes set ' + theme
  else if (_.startsWith(inputVal, "themes set ")) {
    _.keys(theme).forEach(t => {
      if (_.startsWith(t, _.split(inputVal, " ")[2])) {
        hintsCmds = [...hintsCmds, t];
      }
    });
    return hintsCmds;
  }

  else if (inputVal === 'themes') {
    setInputVal('themes set');
  }

  else if (inputVal === 'cd') {
    setInputVal('cd ');
  }

  else if (inputVal === 'cd ') {
    const items = await showFilesAndFoldersNames();
    return items;
    // check things in the directory
    // return things
  }

  else if (inputVal === 'open' || inputVal === 'open ') {
    // check things in the directory but not contain folders
    // return things
    const items = await showFilesNames();
    return items;
  }

  // wait for other cases
};
