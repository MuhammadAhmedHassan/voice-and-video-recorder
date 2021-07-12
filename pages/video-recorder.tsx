import React, { useRef, useState } from "react";

function videoRecorder() {
  const [RECORDING_TIME_MILLISECONDS] = useState(5000);

  const startBtnRef = useRef<HTMLButtonElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const downloadBtnRef = useRef<HTMLAnchorElement>(null);
  const logElementRef = useRef<HTMLDivElement>(null);
  const recordingElementRef = useRef<HTMLVideoElement>(null);

  const log = (str: string) => {
    if (!logElementRef.current || !("innerHTML" in logElementRef.current))
      return;
    logElementRef.current!.innerHTML += str + "\n";
  };

  const wait = async (delay: number) =>
    new Promise((resolve) => setTimeout(resolve, delay));

  const startRecording = async (stream: MediaStream) => {
    const recorder = new MediaRecorder(stream);
    const data: any[] | PromiseLike<any[]> = [];

    recorder.ondataavailable = (event: BlobEvent) => {
      console.log("BLOB_EVENT", event);
      data.push(event.data);
    };

    recorder.start();

    log(
      recorder.state +
        " for " +
        RECORDING_TIME_MILLISECONDS / 1000 +
        " seconds..."
    );

    const stopped = new Promise((resolve, reject) => {
      recorder.onstop = resolve;
      recorder.onerror = reject;
    });

    const recorded = wait(RECORDING_TIME_MILLISECONDS).then(
      () => recorder.state === "recording" && recorder.stop()
    );

    return Promise.all([stopped, recorded]).then(() => data);
  };

  const stopRecording = async (stream: any) =>
    stream.getTracks().forEach((track: any) => track.stop());

  const recordVideo = async () => {
    if (!navigator.mediaDevices || !("getUserMedia" in navigator.mediaDevices))
      return;

    const CONSTRAINTS = { video: true, audio: true };
    try {
      const stream = await navigator.mediaDevices.getUserMedia(CONSTRAINTS);
      previewVideoRef.current!.srcObject = stream;
      downloadBtnRef.current!.href = stream as unknown as string;
      previewVideoRef.current!.captureStream =
        previewVideoRef.current!.captureStream ||
        previewVideoRef.current!.mozCaptureStream;

      // when onplaying becomes true the move to next step
      await new Promise(
        (resolve) => (previewVideoRef.current!.onplaying = resolve)
      );

      const recordedChunks = await startRecording(
        previewVideoRef.current!.captureStream()
      );

      const recordedBlob = new Blob(recordedChunks, { type: "video/webm" });
      recordingElementRef.current!.src = URL.createObjectURL(recordedBlob);
      downloadBtnRef.current!.href = recordingElementRef.current!.src;
      downloadBtnRef.current!.download = "RecordedVideo.webm";

      log(
        "successfully recorded " +
          recordedBlob.size +
          " bytes of " +
          recordedBlob.type +
          " media."
      );
    } catch (error: any) {
      if (error?.message === "Permission denied") {
        alert("Please give permissions to record video");
      }
    }
  };

  return (
    <div>
      <div className="left">
        <button ref={startBtnRef} onClick={recordVideo}>
          Start Recording
        </button>
        <h2>Preview</h2>
        <video ref={previewVideoRef} height="160" width="160" autoPlay muted />

        <a ref={downloadBtnRef} />
        <div ref={logElementRef}></div>
        <button
          onClick={() => stopRecording(previewVideoRef.current!.srcObject)}
        >
          Stop
        </button>
      </div>

      <div className="right">
        <h2>Recording</h2>

        <video ref={recordingElementRef} height="160" width="160" controls />
      </div>
    </div>
  );
}

export default videoRecorder;
