import React, { forwardRef } from "react";
import styles from "./Video.module.css";
import cn from "classnames";

const Video = forwardRef(({isRemotePlayer = false, title = "No Video"}, ref) => { 
  
  return (
    <div className={cn(styles.videoContainer, isRemotePlayer === true ? styles.remotePlayer : styles.localPlayer)}>
      <h1 className={styles.noVideo}>{title}</h1>
      <video ref={ref} className={cn(styles.video)} autoPlay playsInline></video>
    </div>
  );
});

export default Video;
