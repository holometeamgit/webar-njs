// var constants = { };
// let constants = {}
// let singltonObject = null
// let globalState = { }

class TestConst {
    constructor(){
        // console.log("constructor")
        this.globalState = { }
        this.observers = []
    }
    setConstantsWithVideoWidthHeight(vidWidth, vidHeight){
        console.log("setConstantsWithVideoWidthHeight")
        this.globalState.vidWidth = vidWidth
        this.globalState.vidHeight = vidHeight

        this.globalState.boundsWidth = vidWidth
        this.globalState.boundsHeight = vidHeight/2

        // this.globalState.fx = vidWidth
        // this.globalState.fy = -vidHeight

        this.globalState.fx = 610 * vidWidth / 640 //* 0.5 
        this.globalState.fy = -this.globalState.fx

        // this.globalState.fx = vidWidth //* 0.5 
        // this.globalState.fy = -this.globalState.fx

        this.globalState.cx = vidWidth / 2
        this.globalState.cy = vidHeight / 2
        if (this.observers.length === 0){

        } else {
            for (let i = 0; i < this.observers.length; i++){
                this.observers[i]()
            }
        }
    }

    addObserver(newObserver){
        this.observers.push(newObserver)
    }

    getConstantsDict(){
        return this.globalState
    }
}

let constraintsSinglton = Object.freeze(new TestConst());

export {constraintsSinglton}

// class Constants {
//     getInstance() {
//         if (Object.keys(constants).length == 0){
//             setConstrains(720, 1280)
//             setAngle(0, 0, 0)
//         }
//         return this;
//     }

//     setConstrains(vidWidth, vidHeight){
//         constants.vidWidth = vidWidth
//         constants.vidHeight = vidHeight

//         constants.boundsWidth = vidWidth
//         constants.boundsHeight = vidHeight/2

//         constants.fx = 610 * vidWidth / 640
//         constants.fy = -fx

//         constants.cx = vidWidth / 2
//         constants.cy = vidHeight / 2
//     }

//     setAngle(angleX, angleY, angleZ){
//         constants.angleX = angleX
//         constants.angleY = angleY
//         constants.angleZ = angleZ
//     }
// }

