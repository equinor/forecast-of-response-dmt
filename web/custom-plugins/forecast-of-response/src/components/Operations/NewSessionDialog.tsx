import {Dialog, Typography, Wrapper, Button, Label, Input, Table, Scrim} from "@equinor/eds-core-react";
import React from "react";

const NewSessionDialog = (props: { isVisible: boolean, closeNewSessionDialog: Function}): JSX.Element => {
    const {isVisible, closeNewSessionDialog} = props


    return (
        <>
            <Scrim>
                <Dialog>
                        <Dialog.Title>Create new simulation</Dialog.Title>
                </Dialog>
            </Scrim>
            {isVisible && (
                <Scrim>
                    <Dialog>
                        <Dialog.Title>Create new simulation</Dialog.Title>
                        <Dialog.CustomContent>
                            <div>
                                <Label htmlFor="textfield-normal" label="Normal"/>
                                <Input
                                    id="textfield-normal"
                                    placeholder="Placeholder text"
                                    autoComplete="off"
                                />
                            </div>
                            <Table density="comfortable">
                                <Table.Head>
                                    <Table.Row>
                                        <Table.Cell>
                                            SIMA Variables
                                        </Table.Cell>
                                        <Table.Cell>
                                            Default
                                        </Table.Cell>
                                        <Table.Cell>
                                            New value
                                        </Table.Cell>
                                    </Table.Row>
                                </Table.Head>
                                <Table.Body>
                                    <Table.Row>
                                        <Table.Cell>
                                            Wave direction
                                        </Table.Cell>
                                        <Table.Cell>
                                            270
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Input
                                                id="wave-direction-new-value"
                                                placeholder="180"
                                                autoComplete="off"
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table>
                        </Dialog.CustomContent>
                        <Dialog.Actions>
                            <Wrapper>
                                <Button onClick={() => closeNewSessionDialog()}>Cancel</Button>
                                <Button>Run simulation</Button>
                            </Wrapper>
                        </Dialog.Actions>
                    </Dialog>
                </Scrim>
            )}
        </>
    )
}

export default NewSessionDialog
