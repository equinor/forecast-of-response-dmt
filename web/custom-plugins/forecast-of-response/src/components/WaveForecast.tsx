import React, { useState } from 'react'
import LinesOverTime, { TLineChartDataPoint } from './Plots/LinesOverTime'
import { PlotType } from './Result'
import { Slider } from '@equinor/eds-core-react'

const mockWaveHeightData: TLineChartDataPoint[] = [
  {
    timestamp: '01/Sep/2019, 00:00:00',
    'Wave height': 6.453436854234889,
  },
  {
    timestamp: '01/Sep/2019, 03:00:00',
    'Wave height': 6.82369872264042,
  },
  {
    timestamp: '01/Sep/2019, 06:00:00',
    'Wave height': 6.812825460981415,
  },
  {
    timestamp: '01/Sep/2019, 09:00:00',
    'Wave height': 6.690328528656525,
  },
  {
    timestamp: '01/Sep/2019, 12:00:00',
    'Wave height': 9.914089957913058,
  },
  {
    timestamp: '01/Sep/2019, 15:00:00',
    'Wave height': 15.07331291610593,
  },
]

const mockDirectionData: TLineChartDataPoint[] = [
  {
    timestamp: '01/Sep/2019, 00:00:00',
    Direction: 2.453436854234889,
  },
  {
    timestamp: '01/Sep/2019, 03:00:00',
    Direction: 4.82369872264042,
  },
  {
    timestamp: '01/Sep/2019, 06:00:00',
    Direction: 6.812825460981415,
  },
  {
    timestamp: '01/Sep/2019, 09:00:00',
    Direction: 8.690328528656525,
  },
  {
    timestamp: '01/Sep/2019, 12:00:00',
    Direction: 9.914089957913058,
  },
  {
    timestamp: '01/Sep/2019, 15:00:00',
    Direction: 4.07331291610593,
  },
]

const mockWindSpeed: TLineChartDataPoint[] = [
  {
    timestamp: '01/Sep/2019, 00:00:00',
    'Wind speed': 2.453436854234889,
  },
  {
    timestamp: '01/Sep/2019, 03:00:00',
    'Wind speed': 1.82369872264042,
  },
  {
    timestamp: '01/Sep/2019, 06:00:00',
    'Wind speed': 3.812825460981415,
  },
  {
    timestamp: '01/Sep/2019, 09:00:00',
    'Wind speed': 2.690328528656525,
  },
  {
    timestamp: '01/Sep/2019, 12:00:00',
    'Wind speed': 6.914089957913058,
  },
  {
    timestamp: '01/Sep/2019, 15:00:00',
    'Wind speed': 4.07331291610593,
  },
]

export const WaveForecast = () => {
  const timeStamps: string[] = mockWaveHeightData.map((dataPoint) => {
    return dataPoint.timestamp
  })
  const [selectedTime, setSelectedTime] = useState<string>(timeStamps[0])

  const getSliderLabel = (value: any) => {
    return timeStamps[value]
  }

  return (
    <div style={{ width: '100%', height: '1100px' }}>
      <LinesOverTime
        data={mockWaveHeightData}
        timestamp={selectedTime}
        graphNames={[{ name: 'Wave height', plotType: PlotType.LINE }]}
        yAxisUnit={'m'}
      />
      <LinesOverTime
        data={mockDirectionData}
        graphNames={[{ name: 'Direction', plotType: PlotType.LINE }]}
        timestamp={selectedTime}
        yAxisUnit={'direction'}
      />
      <LinesOverTime
        data={mockWindSpeed}
        timestamp={selectedTime}
        graphNames={[{ name: 'Wind speed', plotType: PlotType.LINE }]}
        yAxisUnit={'m/s'}
      />
      <h4 style={{ paddingTop: '20px' }}>Choose forecast lead time:</h4>
      <div style={{ width: '85%', marginLeft: 'auto', marginRight: 'auto' }}>
        <Slider
          ariaLabelledby="Date slider"
          min={0}
          max={timeStamps.length - 1}
          value={0}
          minMaxDots={false}
          minMaxValues={false}
          onChange={(event) => setSelectedTime(timeStamps[event.target.value])}
          outputFunction={getSliderLabel}
        />
      </div>
    </div>
  )
}
