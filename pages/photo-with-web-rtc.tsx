import React, { useEffect, useRef } from "react";

function photoWithWebRtc() {
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const photo = useRef<HTMLImageElement>(null);
  const startbutton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // The width and height of the captured photo. We will set the
    // width to the value defined here, but the height will be
    // calculated based on the aspect ratio of the input stream.

    const width = 320; // We will scale the photo width to this
    let height = 0; // This will be computed based on the input stream

    // |streaming| indicates whether or not we're currently streaming
    // video from the camera. Obviously, we start at false.
    let streaming = false;

    function startup() {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((stream) => {
          video.current!.srcObject = stream;
          video.current!.play();
        })
        .catch((err) => console.log("An error occurred: " + err));

      video.current!.addEventListener(
        "canplay",
        function (ev) {
          if (!streaming) {
            height =
              video.current!.videoHeight / (video.current!.videoWidth / width);
            // Firefox currently has a bug where the height can't be read from
            // the video, so we will make assumptions if this happens.
            if (isNaN(height)) height = width / (4 / 3);

            video.current!.setAttribute("width", width.toString());
            video.current!.setAttribute("height", height.toString());
            canvas.current!.setAttribute("width", width.toString());
            canvas.current!.setAttribute("height", height.toString());
          }
        },
        false
      );

      startbutton.current!.addEventListener(
        "click",
        function (e) {
          takepicture();
          e.preventDefault();
        },
        false
      );

      clearphoto();
    }

    // Fill the photo with an indication that none has been
    // captured.
    function clearphoto() {
      const context = canvas.current!.getContext("2d")!;
      const canvasWidth = canvas.current!.width;
      const canvasHeight = canvas.current!.height;
      context.fillStyle = "#AAA";
      context.fillRect(0, 0, canvasWidth, canvasHeight);

      const data = canvas.current!.toDataURL("image/png");
      photo.current!.setAttribute("src", data);
    }

    // Capture a photo by fetching the current contents of the video
    // and drawing it into a canvas, then converting that to a PNG
    // format data URL. By drawing it on an offscreen canvas and then
    // drawing that to the screen, we can change its size and/or apply
    // other changes before drawing it.

    function takepicture() {
      const context = canvas.current!.getContext("2d")!;
      if (height && width) {
        canvas.current!.height = height;
        canvas.current!.width = width;
        context.drawImage(video.current!, 0, 0, width, height);

        const data = canvas.current!.toDataURL("image/png");
        photo.current!.setAttribute("src", data);
      } else clearphoto();
    }

    // Set up our event listener to run the startup process
    // once loading is complete.
    window.addEventListener("load", startup, false);
  }, []);

  return (
    <div className="contentarea">
      <h1>MDN - WebRTC: Still photo capture demo</h1>
      <p>
        This example demonstrates how to set up a media stream using your
        built-in webcam, fetch an image from that stream, and create a PNG using
        that image.
      </p>
      <div className="camera">
        <video id="video" ref={video}>
          Video stream not available
        </video>
        <button id="startButton" ref={startbutton}>
          Take photo
        </button>
      </div>

      <canvas id="canvas" ref={canvas}></canvas>

      <div className="output">
        <img
          id="photo"
          ref={photo}
          alt="The screen capture will appear in this box."
        />
      </div>

      <p>
        Visit our article{" "}
        <a href="https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Taking_still_photos">
          {" "}
          Taking still photos with WebRTC
        </a>{" "}
        to learn more about the technologies used here.
      </p>
    </div>
  );
}

export default photoWithWebRtc;
