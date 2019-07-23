import React from 'react';
import {StyleSheet, View, Dimensions} from 'react-native';
import Animated from 'react-native-reanimated';
import {PanGestureHandler, State} from 'react-native-gesture-handler';

const {width} = Dimensions.get('window');
import CompassModal from '../../components/compass/NotebookCompassModal';

const {cond, eq, add, call, set, Value, event} = Animated;

export default class Example extends React.Component {
  constructor(props) {
    super(props);
    this.dragX = new Value(0);
    this.dragY = new Value(0);
    this.offsetX = new Value(0);
    this.offsetY = new Value(0);
    this.gestureState = new Value(-1);
    this.onGestureEvent = event([
      {
        nativeEvent: {
          translationX: this.dragX,
          translationY: this.dragY,
          state: this.gestureState,
        },
      },
    ]);

    this.addY = add(this.offsetY, this.dragY);
    this.addX = add(this.offsetX, this.dragX);

    this.transX = cond(
      eq(this.gestureState, State.ACTIVE),
      this.addX,
      set(this.offsetX, this.addX)
    );

    this.transY = cond(eq(this.gestureState, State.ACTIVE), this.addY, [
      set(this.offsetY, this.addY),
    ]);
  }

  onDrop = ([x, y]) => {
    alert(`You dropped at x: ${x} and y: ${y}!`);
  };

  render() {
    return (
      <View style={styles.container}>
        <Animated.Code>
          {() =>
            cond(
              eq(this.gestureState, State.END),
              // call([this.addX, this.addY], this.onDrop)
            )
          }
        </Animated.Code>
        <PanGestureHandler
          maxPointers={1}
          onGestureEvent={this.onGestureEvent}
          onHandlerStateChange={this.onGestureEvent}>
          <Animated.View
            style={[
              this.props.style,
              {
                transform: [
                  {
                    translateX: this.transX,
                  },
                  {
                    translateY: this.transY,
                  },
                ],
              },
            ]}
          >
            {this.props.children}
          </Animated.View>
        </PanGestureHandler>
      </View>
    );
  }
}

const CIRCLE_SIZE = 70;

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    zIndex: 100,
    backgroundColor: 'tomato',
  },
  // box: {
  //   backgroundColor: 'green',
  //   position: 'absolute',
  //   // left: 50,
  //   right: 50,
  //   bottom: 10,
  // }
});
