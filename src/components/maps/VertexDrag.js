import React, {useState} from 'react';
import {Dimensions, Platform, Text, View} from 'react-native';
import {connect} from 'react-redux';
import AnimatedPoint from 'react-native-reanimated';
import {State, PanGestureHandler} from 'react-native-gesture-handler';
import {mapReducers} from './Map.constants';

//Styles
import mapStyles from './Maps.styles';

const {cond, eq, add, call, set, Value, event} = AnimatedPoint;
const {height, width} = Dimensions.get('window');

const vertexDrag = (props) => {

  const [dragX, setDragX] = useState(new Value(0));
  const [dragY, setDragY] = useState(new Value(0));
  const [offsetX, setOffsetX] = useState(new Value(0));
  const [offsetY, setOffsetY] = useState(new Value(0));
  const [gestureState, setGestureState] = useState(new Value(-1));
  const addX = add(offsetX, dragX);
  const addY = add(offsetY, dragY);
  const transX = cond(
    eq(gestureState, State.ACTIVE),
    addX, [
      set(offsetX, addX),
    ],
  );
  const transY = cond(
    eq(gestureState, State.ACTIVE),
    addY, [
      set(offsetY, addY),
    ],
  );

  const onGestureEvent = event([
    {
      nativeEvent: {
        translationX: dragX,
        translationY: dragY,
        state: gestureState,
      },
    },
  ]);

  const onDrop = (coords) => {
    // console.log(`You are at x: ${coords[0]} and y: ${coords[1]}!`);
    let endCoords = [props.vertexStartCoords[0] + coords[0], props.vertexStartCoords[1] + coords[1]];
    console.log('x from comp', coords[0], 'y from comp', coords[1], 'endCoords:', endCoords);
    props.setVertexEndCoords(endCoords);
  };

  return (
    <React.Fragment>
      <AnimatedPoint.Code>
        {() =>
          cond(
            // eq(gestureState, State.ACTIVE),
            eq(gestureState, State.END),
            call([transX, transY], onDrop),
          )
        }
      </AnimatedPoint.Code>
      <PanGestureHandler
        maxPointers={1}
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onGestureEvent}
      >
        <AnimatedPoint.View
          style={[
            mapStyles.vertexEditPoint,
            {
              bottom: props.vertexStartCoords ? height - props.vertexStartCoords[1] - 10 : 0,
              left: props.vertexStartCoords ? props.vertexStartCoords[0] - 10 : 0
            },
            {
              transform: [
                {translateX: transX},
                {translateY: transY},
              ],
            },
          ]}
        >
        </AnimatedPoint.View>
      </PanGestureHandler>
    </React.Fragment>
  );
};

const mapStateToProps = (state) => {
  return {
    vertexStartCoords: state.map.vertexStartCoords,
  };
};

const mapDispatchToProps = {
  setVertexEndCoords: (coords) => ({type: mapReducers.VERTEX_END_COORDS, vertexEndCoords: coords}),
};

export default connect(mapStateToProps, mapDispatchToProps)(vertexDrag);
