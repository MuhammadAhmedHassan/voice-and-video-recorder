import { useEffect, useRef, useState } from "react";

function VideoComponent() {
  const logElement = useRef<HTMLDivElement>(null);
  const previewElement = useRef<HTMLVideoElement>(null);
  const downloadButtonRef = useRef<HTMLAnchorElement>(null);
  const recordingElemRef = useRef<HTMLVideoElement>(null);
  const startButtonRef = useRef<HTMLDivElement>(null);
  const stopButtonRef = useRef<HTMLDivElement>(null);
  /** The length of the videos we'll record. */
  const [recordingTimeMS] = useState(5000);

  const getRefOfElements = () => {
    const constraints = { video: true, audio: true };
    startButtonRef.current!.addEventListener(
      "click",
      async function () {
        try {
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          console.log(stream);
          previewElement.current!.srcObject = stream;
          downloadButtonRef.current!.href = stream as unknown as string;
          previewElement.current!.captureStream =
            previewElement.current!.captureStream ||
            previewElement.current!.mozCaptureStream;
          await new Promise(
            (resolve) => (previewElement.current!.onplaying = resolve)
          );

          const recordedChunks = await startRecording(
            previewElement.current!.captureStream(),
            recordingTimeMS
          );

          console.log("RECORDED_CHUNK", recordedChunks);

          let recordedBlob = new Blob(recordedChunks, { type: "video/webm" });
          recordingElemRef.current!.src = URL.createObjectURL(recordedBlob);
          downloadButtonRef.current!.href = recordingElemRef.current!.src;
          downloadButtonRef.current!.download = "RecordedVideo.webm";

          console.log("recorded_blob", recordedBlob);
          console.log("URL.createObjectURL", URL.createObjectURL(recordedBlob));
          log(
            "Successfully recorded " +
              recordedBlob.size +
              " bytes of " +
              recordedBlob.type +
              " media."
          );
        } catch (err) {
          log(err);
        }
      },
      false
    );

    stopButtonRef.current!.addEventListener("click", function (e) {
      stop(previewElement.current!.srcObject);
    });
  };

  const wait = (delayInMs: number) =>
    new Promise((resolve) => setTimeout(resolve, delayInMs));

  const log = (msg: string) => {
    if (!logElement.current || !("innerHTML" in logElement.current)) return;
    logElement.current.innerHTML += msg + "\n";
  };

  const stop = (stream: any) => {
    stream.getTracks().forEach((track: any) => track.stop());
  };

  const startRecording = async (stream: MediaStream, lengthInMS: number) => {
    console.log("MEDIA_STREAM", stream);
    const recorder = new MediaRecorder(stream);
    console.log("RECORDER", recorder);
    const data: any[] | PromiseLike<any[]> = [];

    recorder.ondataavailable = (event) => {
      data.push(event.data);
      console.log("RECORDER_DATA", data);
    };
    recorder.start();
    log(recorder.state + " for " + lengthInMS / 1000 + " seconds...");

    let stopped = new Promise((resolve, reject) => {
      recorder.onstop = resolve;
      recorder.onerror = (event: MediaRecorderErrorEvent) => reject(event);
    });

    const recorded = wait(lengthInMS).then(
      () => recorder.state === "recording" && recorder.stop()
    );

    return Promise.all([stopped, recorded]).then(() => data);
  };

  useEffect(() => {
    if (!navigator.mediaDevices || !("getUserMedia" in navigator.mediaDevices))
      return;

    getRefOfElements();
    return () => {};
  }, []);

  return (
    <div>
      <div className="left">
        <div id="startButton" ref={startButtonRef} className="button">
          Start
        </div>
      </div>

      <h2>Previews</h2>
      <video
        id="preview"
        ref={previewElement}
        width="160"
        height="120"
        autoPlay
        muted
      ></video>

      <div className="right">
        <div id="stopButton" ref={stopButtonRef} className="button">
          Stop
        </div>
        <h2>Recording</h2>
        <video
          id="recording"
          ref={recordingElemRef}
          width="160"
          height="120"
          controls
        ></video>
        <a id="downloadButton" ref={downloadButtonRef} className="button">
          Download
        </a>
      </div>

      <div ref={logElement}></div>
    </div>
  );
}

export default VideoComponent;

/**        FIRST CODE
 * 
 * const constraints = { audio: true, video: true };
  const videoElementRef = useRef<HTMLVideoElement>(null);

  const getUserMediaDevices = async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
    // videoElem?.srcObject
    if (videoElementRef.current === null) return;
    videoElementRef.current.srcObject = mediaStream;
    videoElementRef.current.onloadedmetadata = function (e) {
      videoElementRef.current?.play();
    };
  };

  useEffect(() => {
    if (!navigator.mediaDevices || !("getUserMedia" in navigator.mediaDevices))
      return;
    getUserMediaDevices();
    return () => {};
  }, []);

  return (
    <div>
      <video ref={videoElementRef}></video>
    </div>
  );
 */
