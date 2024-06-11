"use client";
import React, { Suspense, useRef, useState } from "react";
import "../../styles/configurator.css";
import { SketchPicker } from "react-color";
import * as htmlToImage from "html-to-image";
import FontPicker from "font-picker-react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  useGLTF,
  PresentationControls,
  Stage,
} from "@react-three/drei";
import {
  FacebookShareButton,
  FacebookIcon,
  TwitterShareButton,
  TwitterIcon,
  LinkedinShareButton,
  LinkedinIcon,
  WhatsappShareButton,
  WhatsappIcon,
} from "react-share";
import axios from "axios";
import { Image, Transformation } from "cloudinary-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import Draggable from "react-draggable";
import { MeshStandardMaterial } from "three";

const sizes = [
  { size: "S", price: 20 },
  { size: "M", price: 30 },
  { size: "L", price: 40 },
  { size: "XL", price: 60 },
  { size: "2XL", price: 70 },
  { size: "3XL", price: 80 },
];

function Configurator() {
  // const views = [
  //   {
  //     src: "/images/tshirt.png",
  //     label: "Front View",
  //     style: { width: "5rem", height: "5rem" },
  //   },
  //   {
  //     src: "/images/tshirt.png",
  //     label: "Back View",
  //     style: { transform: "scaleX(-1)", width: "5rem", height: "5rem" },
  //   },
  //   {
  //     src: "/images/tshirt.png",
  //     label: "Left View",
  //     style: { transform: "rotateY(20deg)", width: "5rem", height: "5rem" },
  //   },
  //   {
  //     src: "/images/tshirt.png",
  //     label: "Right View",
  //     style: { transform: "rotateY(-20deg)", width: "5rem", height: "5rem" },
  //   },
  // ];

  const shotref = useRef();
  const [colorchanger, setColor] = useState("#ff6");
  const [colorBox, setColorBox] = useState(false);
  const [quantitiyBox, setQuantitiyBox] = useState(false);
  const [social, setSocial] = useState(false);
  const [file, setfile] = useState("");
  const [image, setImage] = useState("");
  const [logos, setlogos] = useState("");
  const [logosimage, setlogosimage] = useState("");
  const [rotate, setrotate] = useState(0);
  const [increase, setincrease] = useState(1);

  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [textconfigurator, settextconfigurator] = useState(false);
  const [shirttext, setshirttext] = useState("");
  const [bold, setbold] = useState(false);
  const [italic, setitalic] = useState(false);
  const [align, setalign] = useState("center");
  const [size, setsize] = useState(20);
  const [textcolor, settextcolor] = useState(false);
  const [shirttextcolor, setshirttextcolor] = useState("black");
  const [rotatetext, setrotatetext] = useState(0);
  const [increasetext, setincreasetext] = useState(1);
  const [angle, setAngle] = useState(0); // Angle in degrees
  const [familytext, settextfamily] = useState("Open Sans");
  const [options, setoptions] = useState(false);
  const [threed, setthreed] = useState(false);

  const minScale = 0.5; // Minimum scale value
  const maxScale = 2; // Maximum scale value

  const [quantities, setQuantities] = useState(
    sizes.reduce((acc, { size }) => {
      acc[size] = 0;
      return acc;
    }, {})
  );

  const saveState = () => {
    setUndoStack([...undoStack, { colorchanger, quantities }]);
    setRedoStack([]);
  };

  const handleQuantityChange = (size, delta) => {
    saveState();
    setQuantities((prevQuantities) => {
      const newQuantities = {
        ...prevQuantities,
        [size]: Math.max(0, prevQuantities[size] + delta),
      };
      return newQuantities;
    });
  };

  const handleColorChange = (colorValue) => {
    saveState();
    setColor(colorValue.hex);
  };
  const handleTextColorChange = (colorValue) => {
    saveState();
    setshirttextcolor(colorValue.hex);
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    const prevState = undoStack.pop();
    setRedoStack([...redoStack, { colorchanger, quantities }]);
    setColor(prevState.colorchanger);
    setQuantities(prevState.quantities);
    setUndoStack([...undoStack]);
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const nextState = redoStack.pop();
    setUndoStack([...undoStack, { colorchanger, quantities }]);
    setColor(nextState.colorchanger);
    setQuantities(nextState.quantities);
    setRedoStack([...redoStack]);
  };

  const calculateTotalPrice = () => {
    return sizes.reduce(
      (total, { size, price }) => total + price * quantities[size],
      0
    );
  };

  const handleSave = async () => {
    const dataUrl = await htmlToImage.toPng(shotref.current, { pixelRatio: 2 });
    const link = document.createElement("a");
    link.download = "screenshot.png";
    link.href = dataUrl;
    link.click();
  };

  const submitimage = async () => {
    try {
      let formdata = new FormData();
      formdata.append("file", file);
      formdata.append("upload_preset", "mycloud");
      formdata.append("cloud_name", "dmedxpff1");
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dmedxpff1/image/upload",
        formdata,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      // setImage(response.data.secure_url);
      setImage(response.data.public_id);
    } catch (error) {
      console.error("Error uploading image: ", error);
    }
  };
  const submitimagelogos = async () => {
    try {
      let formdata = new FormData();
      formdata.append("file", logos);
      formdata.append("upload_preset", "mycloud");
      formdata.append("cloud_name", "dmedxpff1");
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dmedxpff1/image/upload",
        formdata,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setlogosimage(response.data.public_id);
    } catch (error) {
      console.error("Error uploading image: ", error);
    }
  };
  const transformText = (text, angle) => {
    const chars = text.split("");
    const radius = 200;
    const radians = (Math.PI / 180) * angle;
    const offset = radians / chars.length;

    return chars.map((char, index) => {
      const rotate = offset * index - radians / 2;
      return (
        <span
          key={index}
          style={{
            display: "inline-block",
            transform: `rotate(${rotate}rad) translateY(-${radius}px)`,
            transformOrigin: "center bottom",
          }}
        >
          {char}
        </span>
      );
    });
  };
  function Model() {
    const { scene } = useGLTF("/images/scene.gltf"); // Path to your gltf or glb file
    scene.traverse((child) => {
      if (child.isMesh) {
        // Assuming the model has MeshStandardMaterial, change color as needed
        child.material = new MeshStandardMaterial({ color: colorchanger }); // Change color to red
      }
    });

    return <primitive object={scene} />;
  }

  return (
    <div>
      <div className="container-fluid">
        <div className="row">
          <div className="col-1">
            {/* <div className="filters-box">
              <i className="uil uil-filter"></i>
              <h5>Filters</h5>
            </div> */}
            <div className="logos-box">
              <i className="uil uil-image"></i>
              <h5>
                <label htmlFor="logo_changer">Logos</label>
              </h5>
              <input
                type="file"
                hidden
                id="logo_changer"
                onChange={(e) => setlogos(e.target.files[0])}
              />
              <button onClick={submitimagelogos}>Submit</button>
            </div>
            <div
              className="texts-box"
              onClick={() => settextconfigurator(!textconfigurator)}
            >
              <i className="uil uil-text"></i>
              <h5>Text</h5>
            </div>

            <div className="undos-box">
              <button onClick={undo} disabled={undoStack.length === 0}>
                <i className="uil uil-corner-up-left"></i>
                <h5>Undo</h5>
              </button>
            </div>
            <div className="redos-box">
              <button onClick={redo} disabled={redoStack.length === 0}>
                <i className="uil uil-corner-up-right"></i>
                <h5>Redo</h5>
              </button>
            </div>
            <div className="redos-box">
              <h5 onClick={() => setoptions(!options)}>
                <i className="uil uil-corner-up-right"></i>
                <h5>Options</h5>
              </h5>
            </div>
          </div>
          <div className="col-6 t-shirt-middle-box" ref={shotref}>
            {threed ? (
              <div style={{ marginLeft: "10rem" }}>
                <TransformWrapper>
                  <TransformComponent>
                    <Image
                      cloudName="dmedxpff1"
                      publicId={image ? image : "sorox9iac8lb07wdxiiw"}
                      className="image-t-shirt"
                      alt="something went wrong"
                    >
                      <Transformation
                        width="500"
                        height="500"
                        crop="scale"
                        effect="colorize:60"
                        color={colorchanger}
                      />
                    </Image>
                  </TransformComponent>
                </TransformWrapper>
                <Draggable
                  className="logo-image handle"
                  handle=".handle"
                  defaultPosition={{ x: 0, y: 0 }}
                  grid={[25, 25]}
                  scale={1}
                  bounds={{ left: -80, right: 55, top: -100, bottom: 160 }}
                >
                  <div className="logo-image handle">
                    {textconfigurator && (
                      <div className="curve-text-container">
                        <h6
                          style={{
                            width: "100%",
                            fontSize: size,
                            textAlign: align,
                            fontWeight: bold ? "bold" : "normal",
                            fontStyle: italic ? "italic" : "normal",
                            fontFamily: familytext,
                            color: shirttextcolor,
                            transform: `rotate(${rotatetext}deg) scale(${Math.min(
                              Math.max(increasetext, minScale),
                              maxScale
                            )})`,
                          }}
                        >
                          {transformText(shirttext, angle)}
                        </h6>
                      </div>
                    )}
                    {logosimage && (
                      <Image
                        cloudName="dmedxpff1"
                        publicId={logosimage}
                        className="main_logo_image"
                        alt="something went wrong"
                        style={{
                          transform: `rotate(${rotate}deg) scale(${Math.min(
                            Math.max(increase, minScale),
                            maxScale
                          )})`, // Applying both rotate and scale with limits
                        }}
                      >
                        <Transformation width="100" height="100" crop="scale" />
                      </Image>
                    )}
                  </div>
                </Draggable>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  height: "60%",
                }}
              >
                <div style={{ width: "50%" }}>
                  <Canvas dpr={[1, 2]} camera={{ fov: 45 }}>
                    <color attach="background" args={["#ffffff"]} />
                    <PresentationControls>
                      <Stage>
                        <Model scale={0.01} />
                      </Stage>
                    </PresentationControls>
                  </Canvas>
                  <Draggable
                    className="logo-image handle"
                    handle=".handle"
                    defaultPosition={{ x: 0, y: 0 }}
                    grid={[25, 25]}
                    scale={1}
                    bounds={{ left: -80, right: 55, top: -100, bottom: 160 }}
                  >
                    <div className="logo-image handle">
                      {textconfigurator && (
                        <div className="curve-text-container">
                          <h6
                            style={{
                              width: "100%",
                              fontSize: size,
                              textAlign: align,
                              fontWeight: bold ? "bold" : "normal",
                              fontStyle: italic ? "italic" : "normal",
                              fontFamily: familytext,
                              color: shirttextcolor,
                              transform: `rotate(${rotatetext}deg) scale(${Math.min(
                                Math.max(increasetext, minScale),
                                maxScale
                              )})`,
                            }}
                          >
                            {transformText(shirttext, angle)}
                          </h6>
                        </div>
                      )}
                      {logosimage && (
                        <Image
                          cloudName="dmedxpff1"
                          publicId={logosimage}
                          className="main_logo_image"
                          alt="something went wrong"
                          style={{
                            transform: `rotate(${rotate}deg) scale(${Math.min(
                              Math.max(increase, minScale),
                              maxScale
                            )})`, // Applying both rotate and scale with limits
                          }}
                        >
                          <Transformation
                            width="100"
                            height="100"
                            crop="scale"
                          />
                        </Image>
                      )}
                    </div>
                  </Draggable>
                </div>
              </div>
            )}
            {options &&
              (textconfigurator ? (
                <div>
                  <div className="tshirt-button mt-2">
                    <button
                      className="btn-primary"
                      onClick={() => setrotatetext(rotate + 30)}
                    >
                      +rotate
                    </button>
                    <button
                      className="btn-success"
                      onClick={() => setrotatetext(rotate - 30)}
                    >
                      -rotate
                    </button>
                  </div>
                  <div className="tshirt-button mt-2">
                    <button
                      className="btn-primary"
                      onClick={() => setincreasetext(increase + 0.4)}
                    >
                      +increase
                    </button>
                    <button
                      className="btn-success"
                      onClick={() => setincreasetext(increase - 0.4)}
                    >
                      -increase
                    </button>
                  </div>
                  <div className="tshirt-button mt-2">
                    <button
                      className="btn-primary"
                      onClick={() => setshirttext("")}
                    >
                      delete
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="tshirt-button mt-2">
                    <button
                      className="btn-primary"
                      onClick={() => setrotate(rotate + 30)}
                    >
                      +rotate
                    </button>
                    <button
                      className="btn-success"
                      onClick={() => setrotate(rotate - 30)}
                    >
                      -rotate
                    </button>
                  </div>
                  <div className="tshirt-button mt-2">
                    <button
                      className="btn-primary"
                      onClick={() => setincrease(increase + 0.4)}
                    >
                      +increase
                    </button>
                    <button
                      className="btn-success"
                      onClick={() => setincrease(increase - 0.4)}
                    >
                      -increase
                    </button>
                  </div>
                  <div className="tshirt-button mt-2">
                    <button
                      className="btn-primary"
                      onClick={() => setlogosimage("")}
                    >
                      delete
                    </button>
                  </div>
                </div>
              ))}
            <div className="main-map-image">
              <div className="main-map-image">
                {/* {views.map((value, index) => {
                  return (
                    <div key={index}>
                      <img
                        src={value.src}
                        alt={value.label}
                        style={value.style}
                      />
                      <p>{value.label}</p>
                    </div>
                  );
                })} */}
                {threed ? (
                  <div>
                    <img
                      src={"/images/allset.jpg"}
                      alt={"something went wrong"}
                    />
                    <p>view images</p>
                  </div>
                ) : (
                  <div></div>
                )}
              </div>
            </div>

            <div className="tshirt-button mt-5">
              <button className="btn-warning" onClick={() => setthreed(true)}>
                Normal Mode
              </button>
              <button className="btn-success" onClick={() => setthreed(false)}>
                3D Mode
              </button>
            </div>
          </div>
          {textconfigurator ? (
            <div className="col-5">
              <textarea
                placeholder="enter your text"
                cols={60}
                rows={5}
                onChange={(e) => setshirttext(e.target.value)}
              ></textarea>
              <FontPicker
                apiKey="AIzaSyAu9sl3xE0ap34Mo-pIKdSwR1E3vB2C11E"
                activeFontFamily={familytext}
                onChange={(nextFont) => settextfamily(nextFont.family)}
              />
              {textcolor && (
                <SketchPicker
                  color={colorchanger}
                  onChangeComplete={handleTextColorChange}
                />
              )}{" "}
              <div className="text_configurtors_button">
                <button onClick={() => settextcolor(!textcolor)}>
                  select color
                </button>
                <button onClick={() => setbold(!bold)}>bold</button>
                <button onClick={() => setitalic(!italic)}>italic</button>
                <button onClick={() => setalign("left")}>left</button>
                <button onClick={() => setalign("center")}>middle</button>
                <button onClick={() => setalign("right")}>right</button>
                <div className="inde_textco">
                  <button onClick={() => setsize(size - 1)}>-</button>
                  <button>text size:{size}</button>
                  <button onClick={() => setsize(size + 1)}>+</button>
                </div>
              </div>
              <div style={{ marginTop: "1rem" }}>
                <h6>bend text</h6>
                <input
                  type="number"
                  value={angle}
                  onChange={(e) => setAngle(e.target.value)}
                  style={{ width: "5rem" }}
                />
                <input
                  type="range"
                  min="0"
                  max="180"
                  value={angle}
                  onChange={(e) => setAngle(e.target.value)}
                  style={{ width: "85%" }}
                />
              </div>
            </div>
          ) : (
            <div className="col-5">
              <h5 style={{ marginTop: "10rem" }}>Men T-shirt's</h5>
              <h6>Delivery time: Jun 17 - Jul 04</h6>
              <p>See product details</p>
              <div>
                <button
                  className="btn-warning"
                  onClick={() => setColorBox(!colorBox)}
                >
                  Product Color Choose
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setQuantitiyBox(!quantitiyBox)}
                >
                  Choose Size And Quantity
                </button>
              </div>
              <div>
                {colorBox && (
                  <SketchPicker
                    color={colorchanger}
                    onChangeComplete={handleColorChange}
                  />
                )}
              </div>
              {quantitiyBox && (
                <div className="main-quantitiyBox-button">
                  {sizes.map(({ size, price }) => (
                    <div className="main-button1" key={size}>
                      <h6>{size}</h6>
                      <div className="button1">
                        <button onClick={() => handleQuantityChange(size, -1)}>
                          -
                        </button>
                        <h6>{quantities[size]}</h6>
                        <button onClick={() => handleQuantityChange(size, 1)}>
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                  <div>
                    <h4>Total Price: ${calculateTotalPrice()}</h4>
                  </div>
                </div>
              )}
              <div className="cusotmize-box">
                <button className="saves-box" onClick={handleSave}>
                  <i className="uil uil-upload"></i>
                  <p>Save</p>
                </button>
                <button
                  className="shares-box"
                  onClick={() => setSocial(!social)}
                >
                  <i className="uil uil-corner-up-left"></i>
                  <p>Share</p>
                </button>
              </div>
              <div>
                {social && (
                  <div className="social-box">
                    <FacebookShareButton url="https://www.facebook.com">
                      <FacebookIcon size={32} round={true} />
                    </FacebookShareButton>
                    <TwitterShareButton url="https://www.twitter.com">
                      <TwitterIcon size={32} round={true} />
                    </TwitterShareButton>
                    <LinkedinShareButton url="https://www.linkedin.com">
                      <LinkedinIcon size={32} round={true} />
                    </LinkedinShareButton>
                    <WhatsappShareButton url="https://www.whatsapp.com">
                      <WhatsappIcon size={32} round={true} />
                    </WhatsappShareButton>
                  </div>
                )}
              </div>
              <div className="file-box">
                <input
                  type="file"
                  onChange={(e) => setfile(e.target.files[0])}
                />
                <button onClick={submitimage}>Submit</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Configurator;
