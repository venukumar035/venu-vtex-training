import { IOClients } from '@vtex/api'
import CustomMasterDataClient from './masterdata'

export class Clients extends IOClients {
  public get customMasterData() {
    return this.getOrSet('customMasterData', CustomMasterDataClient)
  }
}