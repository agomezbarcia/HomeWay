<template>
  <div v-if="show" style="text-align:center;">
    <div :class="finalized ? 'circle-loader ' + classResult  : 'circle-loader'">
      <div class="status draw"></div>
    </div>
    <transition name="fade">
      <h4>{{ saveDivMessage }}</h4>
    </transition>
  </div>
</template>

<script>
//https://codepen.io/ne0/pen/MJXwOr to loader div

  export default {
    name: "CircleLoader",
    data () {
      return { 
        show: false,
        finalized: false,
        classResult: '',
        saveDivMessage: ''
      }
    },
    props: { 
      
    },
    
    methods: {

      reset(){
        this.show=false;
        this.finalized = false;
        
        this.classResult = '';
        this.saveDivMessage = '';
      },

      showLoading(newMessage){
        this.show=true;

        this.saveDivMessage = newMessage;
      },

      showEndSuccess(newMessage){
        this.show=true;
        this.finalized = true;

        this.classResult = 'success'
        this.saveDivMessage = newMessage;
      },

      showEndError(newMessage){
        this.show=true;
        this.finalized = true;

        this.classResult = 'failed'
        this.saveDivMessage = newMessage;
      }
    }
  }
</script>

<style scoped>
.circle-loader {
  margin-top: 3.5em;
  margin-bottom: 1em;
  border: 2px solid rgba(0, 0, 0, 0.2);
  border-left-color: #5cb85c;
  animation-name: loader-spin;
  animation-duration: 1s;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
  position: relative;
  display: inline-block;
  vertical-align: top;
}
.circle-loader, .circle-loader:after {
  border-radius: 50%;
  width: 8em;
  height: 8em;
}

.success {
  -webkit-animation: none;
  animation: none;
  border-color: #5cb85c;
  transition: border opacity 500ms ease-out;
}
.success .status.draw:after {
  animation-duration: 1.2s;
  animation-timing-function: ease;
  animation-name: checkmark;
  transform: scaleX(-1) rotate(135deg);
}
.success .status:after {
  opacity: 1;
  height: 4em;
  width: 2em;
  transform-origin: left top;
  border-right: 2px solid #5cb85c;
  border-top: 2px solid #5cb85c;
  content: '';
  left: 1.8095238095em;
  top: 4em;
  position: absolute;
}

.failed {
  -webkit-animation: none;
  animation: none;
  border-color: #FF0000;
  transition: border opacity 500ms ease-out;
}
.failed .status {
  top: 50%;
  left: 50%;
  position: absolute;
}
.failed .status.draw:before, .failed .status.draw:after {
  animation-duration: 1.2s;
  animation-timing-function: ease;
  animation-name: crossmark;
}
.failed .status.draw:before {
  transform: scaleX(-1) rotate(45deg);
}
.failed .status.draw:after {
  transform: scaleX(-1) rotate(225deg);
}
.failed .status:before, .failed .status:after {
  opacity: 1;
  height: 2em;
  width: 2em;
  transform-origin: left top;
  border-right: 2px solid #FF0000;
  border-top: 2px solid #FF0000;
  content: '';
  position: absolute;
}
.failed .status:before {
  left: calc(1.656854259em - 4px);
  top: calc(4px - 1.656854259em);
}
.failed .status:after {
  left: calc(5.656854259px - 1.656854259em);
  top: calc(1.656854259em - 2.8284271295px);
}

@keyframes loader-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
@keyframes checkmark {
  0% {
    height: 0;
    width: 0;
    opacity: 1;
  }
  20% {
    height: 0;
    width: 2em;
    opacity: 1;
  }
  40% {
    height: 4em;
    width: 2em;
    opacity: 1;
  }
  100% {
    height: 4em;
    width: 2em;
    opacity: 1;
  }
}
@keyframes crossmark {
  0% {
    height: 0;
    width: 0;
    opacity: 1;
  }
  20% {
    height: 0;
    width: 2em;
    opacity: 1;
  }
  40% {
    height: 2em;
    width: 2em;
    opacity: 1;
  }
  100% {
    height: 2em;
    width: 2em;
    opacity: 1;
  }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .5s
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0
}
</style>