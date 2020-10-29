import React, {useState} from 'react';
import {Dimensions} from 'react-native';

import {State, PanGestureHandler} from 'react-native-gesture-handler';
import AnimatedPoint from 'react-native-reanimated';
import {useDispatch, useSelector} from 'react-redux';

import {mapReducers} from './maps.constants';
import {setVertexEndCoords} from './maps.slice';
import mapStyles from './maps.styles';

const {cond, eq, add, call, set, Value, event} = AnimatedPoint;
// eslint-disable-next-line no-unused-vars
const {height, width} = Dimensions.get('window');

const VertexDrag = (props) => {
  const dispatch = useDispatch();
  const vertexStartCoords = useSelector(state => state.map.vertexStartCoords);
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
    let endCoords = [vertexStartCoords[0] + coords[0], vertexStartCoords[1] + coords[1]];
    console.log('x from comp', coords[0], 'y from comp', coords[1], 'endCoords:', endCoords);
    dispatch(setVertexEndCoords(endCoords));
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
              bottom: vertexStartCoords ? height - vertexStartCoords[1] - 10 : 0,
              left: vertexStartCoords ? vertexStartCoords[0] - 10 : 0,
            },
            {
              transform: [
                {translateX: transX},
                {translateY: transY},
              ],
            },
          ]}
         />
      </PanGestureHandler>
    </React.Fragment>
  );
};

export default VertexDrag;
