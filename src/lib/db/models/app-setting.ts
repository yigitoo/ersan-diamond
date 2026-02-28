import mongoose, { Schema, model, models } from "mongoose";

interface IAppSetting {
  key: string;
  value: string;
}

const appSettingSchema = new Schema({
  key: { type: String, required: true, unique: true },
  value: { type: String, required: true },
});

export default (models.AppSetting as mongoose.Model<IAppSetting>) ||
  model<IAppSetting>("AppSetting", appSettingSchema);
