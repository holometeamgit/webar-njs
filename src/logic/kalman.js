class KalmanFilter{
	constructor(startVal, initK) {
		this.K = initK
		this.curVal = startVal
		// this.sum = 0
		// this.values = []
		// this.valuesCount = 15
	}

	addNewValue(newValue){
		this.curVal = this.curVal * (1 - this.K) + newValue * this.K
		return this.curVal
	}
}


class KalmanAngleFilter extends KalmanFilter{

	constructor(startVal, initK) {
		super(startVal, initK);
		this.inversSum = true;
	}


	addNewValue(newValue){

		var addValue = this.setValue_0_360(newValue)

		if (this.inversSum){
			addValue = this.inverseAngle(addValue)
		}

		this.curVal = this.curVal * (1 - this.K) + addValue * this.K

		if ( this.checkIfNearZero( this.inverseAngle(this.curVal) ) ){

			if (this.inversSum){
				return this.inverseAngle(this.curVal)
			} else {
				return this.curVal
			}
		} else {
			if (this.inversSum){
				this.curVal = this.inverseAngle(this.curVal)
				this.inversSum = false
			}
		}
		return this.curVal
	}

	setValue_0_360(angle){
		if (angle >= 0){
			return (angle % 360)
		} else {
			return 360 + (angle % 360)
		}
	}

	checkIfNearZero(angle){
		if ( (angle < 90) || (angle > 270) ){
			return true
		}
		return false
	}

	inverseAngle(angle){
		return (angle + 180) % 360
	}
} 

export {KalmanFilter, KalmanAngleFilter}
