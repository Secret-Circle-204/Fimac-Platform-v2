import React from 'react'
import type { UIFieldServerComponent } from 'payload'
import { PropertyTypeWatcherClient } from './Field.client'

export const PropertyTypeWatcherField: UIFieldServerComponent = () => {
  return <PropertyTypeWatcherClient />
}
