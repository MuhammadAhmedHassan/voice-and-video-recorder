import React, { useRef, useEffect, useState } from "react";
import styles from "../styles/voice-recorder.module.css";

interface CreateClipProps {
  id: number;
  title: string;
  onDeleteAudio(id: number): void;
}

function voiceRecorder() {
  // set up basic refs for app
  const stop = useRef<HTMLButtonElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const record = useRef<HTMLButtonElement>(null);
  const mainSection = useRef<HTMLElement>(null);
  const soundClips = useRef<HTMLElement>(null);

  useEffect(() => {
    if (
      !record.current ||
      !stop.current ||
      !soundClips.current ||
      !canvas.current ||
      !mainSection.current
    )
      return;
    // disable stop button while not recording

    stop.current.disabled = true;

    // visualiser setup - create web audio api context and canvas

    let audioCtx: AudioContext;
    const canvasCtx = canvas.current.getContext("2d");

    //main block for doing the audio recording

    if (navigator.mediaDevices.getUserMedia) {
      console.log("getUserMedia supported.");

      const constraints = { audio: true };
      let chunks: BlobPart[] = [];

      let onSuccess = function (stream: MediaStream) {
        const mediaRecorder = new MediaRecorder(stream);

        visualize(stream);

        record.current!.onclick = function () {
          mediaRecorder.start();
          console.log(mediaRecorder.state);
          console.log("recorder started");
          record.current!.style.background = "red";

          stop.current!.disabled = false;
          record.current!.disabled = true;
        };

        stop.current!.onclick = function () {
          mediaRecorder.stop();
          console.log(mediaRecorder.state);
          console.log("recorder stopped");
          record.current!.style.background = "";
          record.current!.style.color = "";
          // mediaRecorder.requestData();

          stop.current!.disabled = true;
          record.current!.disabled = false;
        };

        mediaRecorder.onstop = function (e) {
          console.log("data available after MediaRecorder.stop() called.");

          const clipName = prompt(
            "Enter a name for your sound clip?",
            "My unnamed clip"
          );

          const clipContainer = document.createElement("article");
          const clipLabel = document.createElement("p");
          const audio = document.createElement("audio");
          const deleteButton = document.createElement("button");

          clipContainer.classList.add("clip");
          audio.setAttribute("controls", "");
          deleteButton.textContent = "Delete";
          deleteButton.className = "delete";

          if (clipName === null) {
            clipLabel.textContent = "My unnamed clip";
          } else {
            clipLabel.textContent = clipName;
          }

          clipContainer.appendChild(audio);
          clipContainer.appendChild(clipLabel);
          clipContainer.appendChild(deleteButton);
          soundClips.current!.appendChild(clipContainer);

          audio.controls = true;
          const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
          chunks = [];
          const audioURL = window.URL.createObjectURL(blob);
          audio.src = audioURL;
          console.log("recorder stopped");

          deleteButton.onclick = function (e) {
            let evtTgt = e.target;
            evtTgt!.parentNode.parentNode.removeChild(evtTgt!.parentNode);
          };

          clipLabel.onclick = function () {
            const existingName = clipLabel.textContent;
            const newClipName = prompt("Enter a new name for your sound clip?");
            if (newClipName === null) {
              clipLabel.textContent = existingName;
            } else {
              clipLabel.textContent = newClipName;
            }
          };
        };

        mediaRecorder.ondataavailable = function (e) {
          chunks!.push(e.data);
        };
      };

      let onError = function (err: any) {
        console.log("The following error occured: " + err);
      };

      navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
    } else {
      console.log("getUserMedia not supported on your browser!");
    }

    function visualize(stream: MediaStream) {
      if (!audioCtx) {
        audioCtx = new AudioContext();
      }

      console.log("AUDIO_CONTEXT", audioCtx);

      const source = audioCtx.createMediaStreamSource(stream);

      console.log("AUDIO_CONTEXT_stream_source", source);

      const analyser = audioCtx.createAnalyser();

      console.log("AUDIO_CONTEXT_analyser", analyser);

      analyser.fftSize = 2048;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      source.connect(analyser);
      //analyser.connect(audioCtx.destination);

      draw();

      function draw() {
        const WIDTH = canvas.current!.width;
        const HEIGHT = canvas.current!.height;

        requestAnimationFrame(draw);

        analyser.getByteTimeDomainData(dataArray);

        canvasCtx!.fillStyle = "rgb(200, 200, 200)";
        canvasCtx!.fillRect(0, 0, WIDTH, HEIGHT);

        canvasCtx!.lineWidth = 2;
        canvasCtx!.strokeStyle = "rgb(0, 0, 0)";

        canvasCtx!.beginPath();

        let sliceWidth = (WIDTH * 1.0) / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          let v = dataArray[i] / 128.0;
          let y = (v * HEIGHT) / 2;

          if (i === 0) {
            canvasCtx!.moveTo(x, y);
          } else {
            canvasCtx!.lineTo(x, y);
          }

          x += sliceWidth;
        }

        canvasCtx!.lineTo(canvas.current!.width, canvas.current!.height / 2);
        canvasCtx!.stroke();
      }
    }

    window.onresize = function () {
      canvas.current!.width = mainSection.current!.offsetWidth;
    };

    // window.onresize();
    window.resizeTo(window.screen.availWidth, window.screen.availHeight);
    return () => {};
  }, []);

  return (
    <div>
      <div className="wrapper">
        <header>
          <h1>Web dictaphone</h1>
        </header>

        <section className="main-controls" ref={mainSection}>
          <canvas className="visualizer" ref={canvas} height="60px"></canvas>
          <div id="buttons">
            <button className="record" ref={record}>
              Record
            </button>
            <button className="stop" ref={stop}>
              Stop
            </button>
          </div>
        </section>

        <section className="sound-clips" ref={soundClips}></section>
      </div>

      <label htmlFor="toggle">❔</label>
      <input type="checkbox" id="toggle" />
      <aside>
        <h2>Information</h2>

        <p>
          Web dictaphone is built using{" "}
          <a href="https://developer.mozilla.org/en-US/docs/Web/API/Navigator.getUserMedia">
            getUserMedia
          </a>{" "}
          and the{" "}
          <a href="https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder_API">
            MediaRecorder API
          </a>
          , which provides an easier way to capture Media streams.
        </p>

        <p>
          Icon courtesy of{" "}
          <a href="http://findicons.com/search/microphone">Find Icons</a>.
          Thanks to <a href="http://soledadpenades.com/">Sole</a> for the
          Oscilloscope code!
        </p>
      </aside>
    </div>
  );
}

export default voiceRecorder;
