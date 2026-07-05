import React from 'react'
import type { UploadFieldServerComponent } from 'payload'
import { CustomMediaFieldClient } from './Field.client'

export const CustomMediaField: UploadFieldServerComponent = (props) => {
  const { path, clientField, readOnly, permissions, forceRender, schemaPath } = props

  return (
    <CustomMediaFieldClient 
      path={path} 
      field={clientField} 
      readOnly={readOnly}
      permissions={permissions}
      forceRender={forceRender}
      schemaPath={schemaPath}
    />
  )
}
