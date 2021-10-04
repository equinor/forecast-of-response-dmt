import React, { useEffect, useState } from 'react'
import { Button, Input, Tabs } from '@equinor/eds-core-react'
import styled from "styled-components"
import { ACLEnum } from "../../Enums"
import Icons from "../../Icons"
import { StringMap, TAcl } from "../../Types"

const ACLWrapper = styled.div`
  border: teal 2px solid;
  border-radius: 3px;
  max-width: 650px;
  padding: 10px
`

const TableWrapper = styled.div`
  border: black 1px solid;
  border-radius: 3px;
  max-height: 200px;
  overflow: auto;
  margin-bottom: 10px;
`

const ListRow = styled.div`
  display: flex;
  flex-flow: row;
  align-items: center;
  padding: 5px;
  justify-content: space-around;
  background-color: ${props => {
  if (props.even) return "#F7F7F7"
  return "inherit"
}}
`

const CenteredRow = styled.div`
  display: flex;
  flex-flow: row;
  align-items: center;
  padding-bottom: 10px;
  justify-content: ${props => props.justifyContent || 'space-between'};
  width: ${props => props.width || 'inherit'};
  background-color: ${props => {
    if (props.even) return "#F7F7F7"
    return "inherit"
  }}
`

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  justify-items: center;
  align-items: center;
  background-color: ${props => {
    if (props.even) return "#F7F7F7"
    return "inherit"
  }}
`

const StyledOption = styled.option`
  font-weight: 700;
`
const StyledSelect = styled.select`
  font-weight: 700;
  width: 80px;
  padding: 3px;
  border-radius: 3px;
  background-color: transparent
`


const ACLSelect = ({ value, handleChange }: any): JSX.Element => {
  return (
    <div style={{ width: "150px", padding: "10px" }}>
      <StyledSelect value={value} onChange={(event: Event) => handleChange(event.target.value)}>
        {Object.values(ACLEnum).map((accessLevel: string) =>
          <StyledOption value={accessLevel} key={accessLevel}>{accessLevel}</StyledOption>)}
      </StyledSelect>
    </div>
  )
}

interface ACLOwnerPanelProps {
  acl: TAcl
  handleChange: Function
}

const ACLOwnerPanel = ({ acl, handleChange }: ACLOwnerPanelProps): JSX.Element => {
  return <>
    <CenteredRow width={"230px"}>
      Owner:
      <Input
        style={{ width: "150px", marginLeft: "5px" }}
        placeholder={acl.owner}
        onChange={(event): Event => handleChange({ owner: event.target.value })}/>
      <Icons name="edit_text" size={24} style={{ color: 'teal' }}/>
    </CenteredRow>
    <CenteredRow width={"160px"}>
      Others:
      <ACLSelect value={acl.others} handleChange={(newValue: string) => handleChange({ others: newValue })}/>
    </CenteredRow>
  </>
}

interface URPanelProps {
  entities: StringMap
  handleChange: Function
  aclKey: string

}

const ACLUserRolesPanel = ({ entities, handleChange, aclKey }: URPanelProps): JSX.Element => {
  const [newRole, setNewRole] = useState<string>(null)
  return <>
    <CenteredRow>
      <Input
        style={{ width: "170px" }}
        placeholder={"Add new role"}
        onChange={(e): Event => setNewRole(e.target.value)}/>
      <Button onClick={() => handleChange({ [aclKey]: { ...entities, [newRole]: ACLEnum.NONE } })}
        disabled={!newRole}
      >Add +</Button>
    </CenteredRow>
    <ListRow>
      <div>Role</div>
      <div>Access Level</div>
      <div></div>
    </ListRow>
    <TableWrapper>
      {Object.entries(entities).map(([entity, access], index): any => {
        const roleHandleChange = (value: string) => {
          entities[entity] = value
          handleChange({ [aclKey]: entities })
        }
        return (
          <GridContainer key={entity} even={index % 2 == 0}>
            <div>{entity}</div>
            <ACLSelect value={access} handleChange={roleHandleChange}/>
              <Button variant="outlined" color="danger" onClick={() => {
                  delete entities[entity]
                  handleChange({[aclKey]: entities})
              }}>
                Remove
              </Button>
          </GridContainer>
        )
      })
      }
    </TableWrapper>
  </>
}

export default (documentId: any): JSX.Element => {
  const [activeTab, setActiveTab] = useState<number>(0)
  const [documentACL, setDocumentACL] = useState<TAcl|null>({
    owner: "stoo",
    roles: {
      someRole: "WRITE",
      anotherRole: "READ",
      aThairdt: "NONE",
      someaRole: "WRITE",
      anothderRfsdfsdfsdfolsdfsdfsdfsdfsde: "READ",
      aT: "NONE",
      som4eRole: "WRITE",
      ane: "READ",
      aThirgddt: "NONE",
    },
    users: {
      aGuy: "NONE",
      aDude: "WRITE",
      aFellow: "READ",
    },
    others: "READ",
  })

  // TODO: Some stuff that fetches the ACL for the given document
  useEffect(() => {

  }, [documentId])

  function saveACL(acl: TAcl) {
    //  TODO: Some code to set the edited ACL
  }

  function handleChange(value: Object) {
    setDocumentACL({ ...documentACL, ...value })
  }

  if(!documentACL) return <>Loading...</>

  return (
    <ACLWrapper>
      <h4>Access Control</h4>
      <Tabs activeTab={activeTab} onChange={(index: number) => setActiveTab(index)} variant="fullWidth">
        <Tabs.List>
          <Tabs.Tab>Owner</Tabs.Tab>
          <Tabs.Tab>Roles</Tabs.Tab>
          <Tabs.Tab>Users</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panels>
          <Tabs.Panel><ACLOwnerPanel acl={documentACL} handleChange={handleChange}/></Tabs.Panel>
          <Tabs.Panel><ACLUserRolesPanel aclKey="roles" entities={documentACL.roles}
                                         handleChange={handleChange}/></Tabs.Panel>
          <Tabs.Panel><ACLUserRolesPanel aclKey="users" entities={documentACL.users}
                                         handleChange={handleChange}/></Tabs.Panel>
        </Tabs.Panels>
      </Tabs>
      <CenteredRow>
        <Button variant="outlined" color="danger">
          Cancel
        </Button>
        <Button>
          Save
          <Icons name="save" title="save" size={24}/>
        </Button>
      </CenteredRow>
    </ACLWrapper>

  )
}