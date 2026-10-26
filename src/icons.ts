import add from "@material-symbols/svg-500/rounded/add.svg?raw";
import arrowBack from "@material-symbols/svg-500/rounded/arrow_back.svg?raw";
import home from "@material-symbols/svg-500/rounded/home.svg?raw";
import playPause from "@material-symbols/svg-500/rounded/play_pause.svg?raw";
import power from "@material-symbols/svg-500/rounded/power_settings_new.svg?raw";
import remove from "@material-symbols/svg-500/rounded/remove.svg?raw";
import volumeOff from "@material-symbols/svg-500/rounded/volume_off.svg?raw";
import volumeUp from "@material-symbols/svg-500/rounded/volume_up.svg?raw";

/** Material Symbols Rounded, as in the design; only the ones the page uses get bundled. */
export const icons = { add, arrowBack, home, playPause, power, remove, volumeOff, volumeUp };

export type IconName = keyof typeof icons;
