const handleEmeEncryption = async (event) => {
  const config = [
    {
      initDataTypes: ["cenc"],
      videoCapabilities: [{ contentType: `video/mp4; codecs="avc1.4d4032"` }],
      audioCapabilities: [],
    },
  ];

  const video = document.getElementsByTagName("video")[0];
  const mediaKeysSystemAccess =
    await window.navigator.requestMediaKeySystemAccess(
      "org.w3.clearkey",
      config
    );

  const createdMediaKeys = await mediaKeysSystemAccess.createMediaKeys();
  await video.setMediaKeys(createdMediaKeys);

  const mediaKeys = video.mediaKeys;

  const keysSession = mediaKeys.createSession();

  const handleMessage = (event) => {
    const keySession = event.target;
    var te = new TextEncoder();

    // Base64 - https://cryptii.com/pipes/binary-to-base64
    const base64Key = "hyN9IKGfWKdAwFaE5pm0qg"; // Base64 of 87237D20A19F58A740C05684E699B4AA
    const base64KeyID = "oW5AK5BW43HzbTSKpiu3SQ"; // Base64 of A16E402B9056E371F36D348AA62BB749
    var license = te.encode(
      `{"keys":[{"kty":"oct","k":"${base64Key}","kid":"${base64KeyID}"}],"type":"temporary"}`
    );
    keySession.update(license).catch((error) => {
      console.log("Error: ", error);
    });
  };

  keysSession.addEventListener("message", handleMessage, false);

  await keysSession.generateRequest(event.initDataType, event.initData);
};

const startPlayback = async () => {
  const video = document.getElementById("video");

  const mp4InitializationUri = "./segments/BigBuckBunny_0.mp4";
  const mp4SegmentUri = "./segments/BigBuckBunny_$.mp4";

  const mimeCodec = 'video/mp4; codecs="avc1.4d4032"';
  const segmentsNumber = 3;

  if (!MediaSource.isTypeSupported(mimeCodec)) {
    console.error("Unsupported media format");
    return;
  }

  video.addEventListener("encrypted", handleEmeEncryption, false);

  const mediaSource = new MediaSource(); // mediaSource.readyState === 'closed'
  const url = window.URL.createObjectURL(mediaSource);
  video.src = url;

  async function getMp4Data(mp4Uri) {
    const mp4Response = await fetch(mp4Uri);
    return mp4Response.arrayBuffer();
  }

  async function onSourceOpen() {
    const mediaSource = this;
    let i = 0;
    URL.revokeObjectURL(video.src); // Revoke Object URL for garbage collection
    const sourceBuffer = mediaSource.addSourceBuffer(mimeCodec);

    sourceBuffer.addEventListener("updateend", async function () {
      if (!sourceBuffer.updating && i !== segmentsNumber) {
        i++;
        const nextSegmentUri = mp4SegmentUri.replace("$", i);
        const nextSegment = await getMp4Data(nextSegmentUri); // Next segments
        sourceBuffer.appendBuffer(nextSegment);
      }
      if (mediaSource.readyState === "open" && i === segmentsNumber) {
        mediaSource.endOfStream();
      }
    });

    const firstSegment = await getMp4Data(mp4InitializationUri); // First segment is here
    sourceBuffer.appendBuffer(firstSegment);
  }

  mediaSource.addEventListener("sourceopen", onSourceOpen.bind(mediaSource));
};

startPlayback();
