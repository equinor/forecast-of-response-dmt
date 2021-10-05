import React from 'react'
import styled from 'styled-components'
import { TComment } from '../Types'

const IconWrapper = styled.div`
  width: 22px;
  height: 22px;
  color: ${(props) => props?.color};
  font-size: x-large;
  padding: 0 3px;
  display: flex;
  align-items: center;
`

const CommentHeaderWrapper = styled.div`
  display: flex;
  flex-direction: row;
`
const CommentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 7px;
  border: darkgrey 2px solid;
  border-radius: 5px;
  margin: 5px;
`

const MessageWrapper = styled.div`
  max-height: 100px;
  overflow-y: scroll;
  &::-webkit-scrollbar {
    display: none;
  }
`
interface ICompactCommentView {
  comment: TComment
}

export const CompactCommentView = ({ comment }: ICompactCommentView) => {
  return (
    <CommentWrapper>
      <CommentHeaderWrapper>
        <IconWrapper color={'grey'}>&#9679;</IconWrapper>
        <b>{comment.author}</b>
      </CommentHeaderWrapper>
      <b style={{ width: 'fit-content' }}>
        {new Date(comment.date).toLocaleString()}
      </b>
      <div style={{ borderBottom: 'black 1px solid', width: 'fit-content' }}>
        {comment.operation}
      </div>
      <MessageWrapper>{comment.message}</MessageWrapper>
    </CommentWrapper>
  )
}
