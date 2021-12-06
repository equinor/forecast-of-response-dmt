import React, { useEffect, useState } from 'react'
import { Button, Label } from '@equinor/eds-core-react'
import { StyledSelect } from './Input'
import DateRangePicker from './DateRangePicker'
import styled from 'styled-components'
import { TCronJob } from '../Types'

enum Interval {
  DAILY = 'Daily',
  WEEKLY = 'Weekly',
  MONTHLY = 'Monthly',
}

// Creates a list like ["00:00",...,"24:00"]
function generateSelectableTimes(): string[] {
  let selectableTimes = []
  for (let i = 0; i < 25; i++) {
    selectableTimes.push(`${i}:00`)
  }
  return selectableTimes
}

const Wrapper = styled.div`
  display: flex;
  background-color: #ffffff;
  padding: 1rem;
  flex-direction: column;
  height: 300px;
  width: 400px;
  justify-content: space-between;
`

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: inherit;
  justify-content: space-around;
  margin: 20px;
`

export function CreateReoccurringJob(props: {
  close: Function
  removeJob: Function
  setCronJob: Function
  cronJob?: TCronJob | undefined
}) {
  const { close, removeJob, setCronJob, cronJob } = props
  const [schedule, setSchedule] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<[Date, Date] | [null, null]>([
    null,
    null,
  ])
  const [interval, setInterval] = useState<Interval>(Interval.DAILY)
  const [hour, setHour] = useState<string>('23')
  const [minute, setMinute] = useState<string>('30')

  useEffect(() => {
    let newMinute = minute
    let newHour = hour
    let dayOfMonth = '*'
    let month = '*'
    let dayOfWeek = '*'

    switch (interval) {
      case Interval.WEEKLY:
        dayOfMonth = '*'
        dayOfWeek = '6'
        break
      case Interval.MONTHLY:
        dayOfMonth = '1'
        break
    }
    setSchedule(`${newMinute} ${newHour} ${dayOfMonth} ${month} ${dayOfWeek}`)
  }, [interval, hour, minute])
  return (
    <Wrapper>
      <h3>Set a schedule for the job</h3>
      <InputWrapper>
        <DateRangePicker
          setDateRange={(dateRange: [Date, Date]) => setDateRange(dateRange)}
          value={dateRange}
        />
        <div
          style={{
            flexDirection: 'row',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Label label="Interval" />
            <StyledSelect onChange={(e: Event) => setInterval(e.target.value)}>
              {Object.entries(Interval).map(([key, value]: any) => (
                <option key={key} value={value}>
                  {value}
                </option>
              ))}
            </StyledSelect>

            {interval === 'Weekly' && (
              <small>Will run on sunday in every week</small>
            )}
            {interval === 'Monthly' && (
              <small>Will run on the 1st on every month</small>
            )}
          </div>
          <div>
            <Label label="Time" />
            <StyledSelect
              onChange={(e: Event) => {
                const hourAndMinute = e.target.value
                const [newHour, newMinute] = hourAndMinute.split(':')
                setMinute(newMinute)
                setHour(newHour)
              }}
            >
              {generateSelectableTimes().map((value: string, index) => (
                <option key={index} value={value}>
                  {value}
                </option>
              ))}
            </StyledSelect>
          </div>
        </div>
      </InputWrapper>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          margin: '10px',
        }}
      >
        <Button color={'secondary'} onClick={() => close()}>
          Close
        </Button>
        <Button
          disabled={Object.keys(cronJob).length === 0}
          color="danger"
          variant="outlined"
          onClick={() => {
            removeJob()
            close()
          }}
        >
          Remove
        </Button>
        <Button
          onClick={() => {
            setCronJob({
              cron: schedule,
              startDate: dateRange[0]?.toISOString(),
              endDate: dateRange[1]?.toISOString(),
            })
            close()
          }}
        >
          Set
        </Button>
      </div>
    </Wrapper>
  )
}
